# import yfinance as yf
# from .blocks import execute_strategy

# def simulate_realtime(config):
#     df = yf.download(config['ticker'], period="5d", interval="1m")
#     df = execute_strategy(df, config)

#     portfolio = {'cash': 10000, 'position': 0, 'value': []}

#     for i in range(1, len(df)):
#         signal = df['Signal'].iloc[i - 1]
#         price = df['Close'].iloc[i]
#         if signal == 1 and portfolio['cash'] >= price:
#             portfolio['position'] += 1
#             portfolio['cash'] -= price
#         elif signal == -1 and portfolio['position'] > 0:
#             portfolio['cash'] += price
#             portfolio['position'] -= 1

#         total_value = portfolio['cash'] + portfolio['position'] * price
#         portfolio['value'].append(total_value)

#     return {
#         'timestamps': df.index.strftime('%H:%M').tolist(),
#         'portfolio_value': portfolio['value']
#     }

import yfinance as yf
import pandas as pd
from .blocks import execute_strategy

def simulate_realtime(config):
    ticker = config.get("ticker", "AAPL")
    ma_period = config.get("ma_period", 20)

    df = yf.download(ticker, period="5d", interval="1m", auto_adjust=True)

    if df is None or df.empty:
        return {"error": f"No intraday data found for ticker '{ticker}'."}

    # 🔧 Flatten MultiIndex columns: e.g., ('Close', 'AAPL') -> 'Close'
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]

    # 🧼 Clean up column names
    df.columns = [str(col).strip().capitalize() for col in df.columns]

    if "Close" not in df.columns:
        return {"error": f"'Close' column not found. Columns: {df.columns.tolist()}"}

    # 🧠 Make sure 'Datetime' becomes index if needed
    if "Datetime" not in df.columns:
        df.reset_index(inplace=True)

    df.set_index("Datetime", inplace=True)

    # 🔁 Run strategy logic
    df = execute_strategy(df, config)

    df["Returns"] = df["Close"].pct_change().fillna(0)
    df["StrategyReturns"] = df["Signal"].shift(1) * df["Returns"]
    df["Portfolio"] = (1 + df["StrategyReturns"]).cumprod().fillna(1)

    return {
        "timestamps": df.index.strftime("%H:%M").tolist(),
        "portfolio_value": df["Portfolio"].tolist()
    }