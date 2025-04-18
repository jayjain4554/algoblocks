import yfinance as yf
import pandas as pd
from .blocks import execute_strategy

def run_backtest(config):
    ticker = config.get("ticker", "AAPL")

    df = yf.download(ticker, period="1y", auto_adjust=True)

    if df is None or df.empty:
        return {"error": f"No data found for ticker '{ticker}'."}

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]

    df.columns = [str(col).strip().capitalize() for col in df.columns]

    if 'Close' not in df.columns:
        return {
            "error": f"'Close' column not found. Available columns: {df.columns.tolist()}"
        }

    if 'Date' not in df.columns:
        df.reset_index(inplace=True)

    df.set_index('Date', inplace=True)

    df = execute_strategy(df, config)

    if 'Signal' not in df.columns:
        return {"error": "Strategy logic failed. No 'Signal' column returned."}

    df['Returns'] = df['Close'].pct_change()
    df['StrategyReturns'] = df['Signal'].shift(1) * df['Returns']
    df['CumulativeMarket'] = (1 + df['Returns']).cumprod().fillna(1)
    df['CumulativeStrategy'] = (1 + df['StrategyReturns']).cumprod().fillna(1)

    # Sharpe ratio (annualized)
    if df['StrategyReturns'].std() == 0:
        sharpe = None
    else:
        sharpe = round(df['StrategyReturns'].mean() / df['StrategyReturns'].std() * (252 ** 0.5), 3)

    # Max drawdown
    cumulative_strategy = df['CumulativeStrategy']
    running_max = cumulative_strategy.cummax()
    drawdowns = (cumulative_strategy - running_max) / running_max
    max_drawdown = round(drawdowns.min() * 100, 2)

    # Total return
    total_return = round((cumulative_strategy.iloc[-1] - 1) * 100, 2)

    return {
        "market": df['CumulativeMarket'].tolist(),
        "strategy": cumulative_strategy.tolist(),
        "sharpe": sharpe,
        "max_drawdown": max_drawdown / 100 if max_drawdown is not None else None,
        "total_return": total_return / 100 if total_return is not None else None,
        "timestamps": df.index.strftime('%Y-%m-%d').tolist()
    }
