import pandas as pd

def moving_average(data, period):
    return data['Close'].rolling(window=period).mean()

def rsi(data, period=14):
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def macd(data, short=12, long=26, signal=9):
    short_ema = data['Close'].ewm(span=short, adjust=False).mean()
    long_ema = data['Close'].ewm(span=long, adjust=False).mean()
    macd_line = short_ema - long_ema
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    return macd_line, signal_line

def bollinger_bands(data, period=20):
    sma = data['Close'].rolling(window=period).mean()
    std = data['Close'].rolling(window=period).std()
    upper = sma + (std * 2)
    lower = sma - (std * 2)
    return upper, lower

def execute_strategy(data, config):
    data['Signal'] = 0
    if 'ma_period' in config:
        ma = moving_average(data, config['ma_period'])
        data.loc[data['Close'] > ma, 'Signal'] = 1
        data.loc[data['Close'] < ma, 'Signal'] = -1
    if 'rsi_period' in config:
        data['RSI'] = rsi(data, config['rsi_period'])
        data.loc[data['RSI'] > 70, 'Signal'] = -1
        data.loc[data['RSI'] < 30, 'Signal'] = 1
    if 'use_macd' in config and config['use_macd']:
        data['MACD'], data['MACD_signal'] = macd(data)
        data.loc[data['MACD'] > data['MACD_signal'], 'Signal'] = 1
        data.loc[data['MACD'] < data['MACD_signal'], 'Signal'] = -1
    if 'use_bollinger' in config and config['use_bollinger']:
        data['upper'], data['lower'] = bollinger_bands(data)
        data.loc[data['Close'] > data['upper'], 'Signal'] = -1
        data.loc[data['Close'] < data['lower'], 'Signal'] = 1
    return data