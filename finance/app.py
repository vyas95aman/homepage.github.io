import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash
import datetime

from helpers import apology, login_required, lookup, usd

# export API_KEY=pk_89ea9ac38550447aba840aa0c6aa2741

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")

# Make sure API key is set
if not os.environ.get("API_KEY"):
    raise RuntimeError("API_KEY not set")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    """Show portfolio of stocks"""

    user_portfolio = db.execute(
        "SELECT symbol, company_name, shares, price, total FROM portfolio WHERE user_id = ?", session["user_id"])

    # update stock prices
    total_stock = 0
    for stock in user_portfolio:
        symbol = stock["symbol"]
        shares = stock["shares"]
        stock = lookup(symbol)
        total = shares * stock["price"]
        db.execute("UPDATE portfolio SET price = ?, total = ? WHERE user_id = ? AND symbol = ?",
                   stock["price"], total, session["user_id"], symbol)
        total_stock += total  # counter for grand total
        # Delete row if stocks are all sold
        if shares == 0:
            db.execute("DELETE FROM portfolio WHERE user_id = ? AND symbol = ?", session["user_id"], symbol)

    cash_query = db.execute("SELECT cash FROM users WHERE id = ?", session["user_id"])
    cash = cash_query[0]["cash"]
    total = cash + total_stock

    portfolio = db.execute("SELECT * FROM portfolio WHERE user_id = ?", session["user_id"])

    return render_template("index.html", portfolio=portfolio, cash=cash, total=total)


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""
    if request.method == "POST":
        try:
            stock = lookup(request.form.get("symbol"))
        except:
            return apology("Please enter a valid stock ticker symbol")
        try:
            shares = int(request.form.get("shares"))
        except:
            return apology("Shares must be a positive ingeter")

        if shares <= 0:
            return apology("Please enter a valid number of shares")
        if stock == None:
            return apology("Enter valid stock")

        price = stock["price"]
        name = stock["name"]
        symbol = stock["symbol"]
        id = session["user_id"]

        # see if user has enough $ to buy
        money_query = db.execute("SELECT cash FROM users WHERE id = ?", id)
        cash = float(money_query[0]["cash"])
        # if enough, execute purchase
        if cash >= (price * shares):
            cash_left = cash - (price * shares)
            db.execute("UPDATE users SET cash = ? WHERE id = ?", cash_left, id)
            time = datetime.datetime.now()
            total = shares * price

            # update user portfolio
            user_shares = db.execute("SELECT shares FROM portfolio WHERE user_id = ? AND symbol = ?", id, symbol)
            if not user_shares:
                db.execute("INSERT INTO portfolio (user_id, company_name, symbol, shares, price, total) VALUES (?, ?, ?, ?, ?, ?)",
                           id, name, symbol, shares, price, total)
            else:
                total_shares = user_shares[0]["shares"] + shares
                db.execute("UPDATE portfolio SET shares = ? WHERE user_id = ? AND symbol = ?", total_shares, id, symbol)

            # update transactions table
            db.execute("INSERT INTO transactions (user_id, symbol, shares, price, time) VALUES (?, ?, ?, ?, ?)",
                       id, symbol, shares, price, time)

            flash("Stock Purchased!")

            return redirect("/")

        # if not, cancel and print error
        else:
            return apology("Not enough cash to buy stock")

    else:
        return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""
    stocks = db.execute("SELECT * FROM transactions WHERE user_id = ?", session["user_id"])
    return render_template("history.html", stocks=stocks)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        flash("Welcome Back!")

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    if request.method == "POST":
        stock = lookup(request.form.get("symbol"))
        if not stock:
            return apology("Please enter a valid stock symbol")
        return render_template("quoted.html", stock=stock)
    else:
        return render_template("quote.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    session.clear()

    if request.method == "GET":
        return render_template("register.html")

    if request.method == "POST":
        username = request.form.get("username")
        # Verify registration parameters
        if not username:
            return apology("username field empty")
        elif not request.form.get("password") or not request.form.get("confirmation"):
            return apology("password/confirmation field empty")
        elif request.form.get("password") != request.form.get("confirmation"):
            return apology("passwords do not match")

        # Check if user exists
        if len(db.execute("SELECT username FROM users WHERE username = ?", username)) != 0:
            return apology("Username already exists.")

        password = generate_password_hash(request.form.get("password"))
        db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", username, password)
        rows = db.execute("SELECT * FROM users WHERE username = ?", username)
        # Log in new user after registration
        session["user_id"] = rows[0]["id"]
        flash("Welcome!")
        return redirect("/")

    else:
        return render_template("register.html")  # register.HTML


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""
    if request.method == "POST":
        symbol = request.form.get("symbol")
        shares = int(request.form.get("shares"))

        if not symbol:
            return apology("Please select a valid stock")
        if not shares or shares < 0:
            return apology("Please enter number of shares to sell")

        current_shares = db.execute("SELECT shares FROM portfolio WHERE user_id = ? AND symbol = ?", session["user_id"], symbol)
        current_shares = current_shares[0]["shares"]

        if current_shares < shares:
            return apology("You do not own that many stocks")
        else:
            new_shares = current_shares - shares
            stock = lookup(symbol)
            profit = shares * stock["price"]
            time = datetime.datetime.now()
            price = stock["price"]
            db.execute("INSERT INTO transactions (user_id, symbol, shares, price, time) VALUES (?, ?, ?, ?, ?)",
                       session["user_id"], symbol, -shares, price, time)
            new_total = current_shares * price - profit
            db.execute("UPDATE portfolio SET shares = ?, price = ?, total = ? WHERE user_id = ? AND symbol = ?",
                       new_shares, price, new_total, session["user_id"], symbol)
            current_cash = db.execute("SELECT cash FROM users WHERE id = ?", session["user_id"])
            new_cash = current_cash[0]["cash"] + profit
            db.execute("UPDATE users SET cash = ? WHERE id = ?", new_cash, session["user_id"])

            flash("Successfully Sold Stock!")

            return redirect("/")

    else:
        stocks = db.execute("SELECT symbol FROM portfolio WHERE user_id = ?", session["user_id"])
        return render_template("sell.html", stocks=stocks)


@app.route("/change_password", methods=["GET", "POST"])
@login_required
def change_password():
    if request.method == "POST":

        old = request.form.get("old_password")
        new = request.form.get("new_password")
        confirmation = request.form.get("confirmation")
        hash = db.execute("SELECT hash FROM users WHERE id = ?", session["user_id"])

        if not old or not new or not confirmation:
            return apology("All fields must be completed")
        if new != confirmation:
            return apology("Passwords do not match")
        if not check_password_hash(hash[0]["hash"], old):
            return apology("Invalid password")

        new_hash = generate_password_hash(new)
        db.execute("UPDATE users SET hash = ? WHERE id = ?", new_hash, session["user_id"])

        flash("Password Changed!")
        return redirect("/")

    else:
        return render_template("change_password.html")

