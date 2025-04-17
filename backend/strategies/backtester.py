import yfinance as yf
import pandas as pd
from .blocks import execute_strategy

def run_backtest(config):
    ticker = config.get("ticker", "AAPL")

    # Step 1: Download data
    df = yf.download(ticker, period="1y", auto_adjust=True)

    print("DEBUG: df.columns =", df.columns)
    print("DEBUG: first few rows:", df.head())

    # Step 2: Check for failure
    if df is None or df.empty:
        return {"error": f"No data found for ticker '{ticker}'."}

    # Step 3: Flatten MultiIndex if exists (for tickers like AAPL)
    if isinstance(df.columns, pd.MultiIndex):
        # ('AAPL', 'Close') → 'Close'
        df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]

    # Step 4: Normalize column names
    df.columns = [str(col).strip().capitalize() for col in df.columns]

    # Step 5: Confirm required column
    if 'Close' not in df.columns:
        return {
            "error": f"'Close' column not found. Available columns: {df.columns.tolist()}"
        }

    # Step 6: Make sure 'Date' is the index
    if 'Date' not in df.columns:
        df.reset_index(inplace=True)

    df.set_index('Date', inplace=True)

    # Step 7: Apply strategy
    df = execute_strategy(df, config)

    if 'Signal' not in df.columns:
        return {"error": "Strategy logic failed. No 'Signal' column returned."}

    # Step 8: Backtest metrics
    df['Returns'] = df['Close'].pct_change()
    df['StrategyReturns'] = df['Signal'].shift(1) * df['Returns']
    df['CumulativeMarket'] = (1 + df['Returns']).cumprod().fillna(1)
    df['CumulativeStrategy'] = (1 + df['StrategyReturns']).cumprod().fillna(1)

    sharpe = df['StrategyReturns'].mean() / df['StrategyReturns'].std() * (252 ** 0.5)

    # Step 9: Return result
    return {
        "cumulative_market": df['CumulativeMarket'].tolist(),
        "cumulative_strategy": df['CumulativeStrategy'].tolist(),
        "sharpe": round(sharpe, 3),
        "timestamps": df.index.strftime('%Y-%m-%d').tolist()
    }