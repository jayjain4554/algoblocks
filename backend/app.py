# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from strategies.backtester import run_backtest
# from strategies.simulator import simulate_realtime
# from database import db, Strategy
# import os

# app = Flask(__name__)
# CORS(app)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///algoblocks.db'
# db.init_app(app)

# # @app.route('/backtest', methods=['POST'])
# # def backtest():
# #     config = request.json
# #     results = run_backtest(config)
# #     return jsonify(results)

# @app.route("/backtest", methods=["POST"])
# def backtest():
#     data = request.get_json()
#     print("Received JSON:", data)  # 👈 This helps you see what’s coming in
    
#     if data is None:
#         return jsonify({"error": "Invalid or missing JSON"}), 400

#     try:
#         # ticker = data.get("ticker")
#         # ma_period = data.get("ma_period")
#         # use_macd = data.get("use_macd")
#         # use_bollinger = data.get("use_bollinger")

#         # # Simulated response for now
#         # result = {
#         #     "message": "Backtest received",
#         #     "ticker": ticker,
#         #     "ma_period": ma_period,
#         #     "use_macd": use_macd,
#         #     "use_bollinger": use_bollinger
#         # }

#         # return jsonify(result)

#         result = run_backtest(data)
#         return jsonify(result)

#     except Exception as e:
#         print("Error in /backtest:", e)
#         return jsonify({"error": str(e)}), 500


# @app.route('/simulate', methods=['POST'])
# def simulate():
#     config = request.json
#     result = simulate_realtime(config)
#     return jsonify(result)

# @app.route('/strategies', methods=['POST'])
# def save_strategy():
#     data = request.json
#     strategy = Strategy(name=data['name'], config=data['config'])
#     db.session.add(strategy)
#     db.session.commit()
#     return jsonify({'status': 'success'})

# @app.route("/")
# def home():
#     return "Hello, Flask is running!"

# if __name__ == '__main__':
#     with app.app_context():
#         db.create_all()
#     app.run(debug=True)

# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host="0.0.0.0", port=port, debug=False)

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from strategies.backtester import run_backtest
# from strategies.simulator import simulate_realtime
# from database import db, Strategy
# import os

# app = Flask(__name__)
# CORS(app)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///algoblocks.db'
# db.init_app(app)

# @app.route("/backtest", methods=["POST"])
# def backtest():
#     try:
#         data = request.get_json()
#         result = run_backtest(data)
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route("/simulate", methods=["POST"])
# def simulate():
#     try:
#         config = request.json
#         result = simulate_realtime(config)
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # @app.route("/strategies", methods=["POST"])
# # def save_strategy():
# #     data = request.json
# #     strategy = Strategy(name=data['name'], config=data['config'])
# #     db.session.add(strategy)
# #     db.session.commit()
# #     return jsonify({'status': 'success'})

# @app.route('/strategies', methods=['POST'])
# def save_strategy():
#     try:
#         data = request.get_json()
#         print("📥 Received data:", data)

#         name = data.get("name")
#         config = data.get("config")
#         print("✅ Parsed name:", name)
#         print("✅ Parsed config:", config)

#         strategy = Strategy(name=name, config=config)
#         db.session.add(strategy)
#         db.session.commit()

#         return jsonify({"status": "success"})
    
#     except Exception as e:
#         print("🔥 ERROR saving strategy:", str(e))
#         return jsonify({"error": str(e)}), 500


# @app.route("/")
# def home():
#     return "Hello, Flask is running!"

# # 🔥 DO NOT remove or modify this block — it's what Render depends on:
# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host="0.0.0.0", port=port)

# if __name__ == "__main__":
#     with app.app_context():
#         db.create_all()
#     app.run(host="0.0.0.0", port=7777)


from flask import Flask, request, jsonify
from flask_cors import CORS
from strategies.backtester import run_backtest
from strategies.simulator import simulate_realtime
from database import db, Strategy
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///algoblocks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.route("/")
def home():
    return "Hello, Flask is running!"

@app.route("/backtest", methods=["POST"])
def backtest():
    try:
        data = request.get_json()
        result = run_backtest(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/simulate", methods=["POST"])
def simulate():
    try:
        config = request.get_json()
        result = simulate_realtime(config)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/strategies", methods=["POST"])
def save_strategy():
    try:
        data = request.get_json()
        name = data.get("name")
        config = data.get("config")
        strategy = Strategy(name=name, config=config)
        db.session.add(strategy)
        db.session.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/strategies", methods=["GET"])
def get_strategies():
    try:
        strategies = Strategy.query.all()
        result = [{"id": s.id, "name": s.name, "config": s.config} for s in strategies]
        return jsonify(result)
    except Exception as e:
        print("🔥 ERROR fetching strategies:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/strategies/<int:id>", methods=["DELETE"])
def delete_strategy(id):
    try:
        strategy = Strategy.query.get(id)
        if not strategy:
            return jsonify({"error": "Strategy not found"}), 404
        
        db.session.delete(strategy)
        db.session.commit()
        return jsonify({"status": "deleted"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/strategies/<int:id>", methods=["PUT"])
def rename_strategy(id):
    try:
        data = request.get_json()
        new_name = data.get("name")

        strategy = Strategy.query.get(id)
        if not strategy:
            return jsonify({"error": "Strategy not found"}), 404

        strategy.name = new_name
        db.session.commit()
        return jsonify({"status": "renamed", "new_name": new_name})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Launching Flask with DB init")
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
