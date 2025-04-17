import pandas as pd
from strategies.blocks import moving_average, rsi, macd, bollinger_bands

def test_moving_average():
    data = pd.DataFrame({'Close': [10, 20, 30, 40, 50]})
    ma = moving_average(data, 2)
    assert not ma.isna().all()

def test_rsi():
    data = pd.DataFrame({'Close': [10, 11, 12, 13, 14, 15]})
    rsi_values = rsi(data)
    assert not rsi_values.isna().all()

def test_macd():
    data = pd.DataFrame({'Close': [1, 2, 3, 4, 5, 6, 7, 8, 9]})
    macd_line, signal_line = macd(data)
    assert len(macd_line) == len(data)
    assert len(signal_line) == len(data)

def test_bollinger_bands():
    data = pd.DataFrame({'Close': [10, 12, 13, 15, 14, 13, 12, 11, 10, 9, 8]})
    upper, lower = bollinger_bands(data)
    assert len(upper) == len(data)
    assert len(lower) == len(data)