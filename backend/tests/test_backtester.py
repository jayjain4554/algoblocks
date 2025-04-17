from strategies.backtester import run_backtest

def test_run_backtest():
    config = {"ticker": "AAPL", "ma_period": 10}
    result = run_backtest(config)
    assert 'cumulative_market' in result
    assert 'cumulative_strategy' in result
    assert 'sharpe' in result