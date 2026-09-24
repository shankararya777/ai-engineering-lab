# Simple Python Calculator for Beginners

# Step 1: Get numbers from the user
# We use float() so the user can enter both whole numbers and decimals.
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))

# Step 2: Ask the user to choose an operation
print("Choose an operation:")
print("+ : Addition")
print("- : Subtraction")
print("* : Multiplication")
print("/ : Division")

operation = input("Enter operator (+, -, *, /): ")

# Step 3 & 4: Perform the selected calculation and display the result
if operation == "+":
    result = num1 + num2
    print(f"Result: {num1} + {num2} = {result}")

elif operation == "-":
    result = num1 - num2
    print(f"Result: {num1} - {num2} = {result}")

elif operation == "*":
    result = num1 * num2
    print(f"Result: {num1} * {num2} = {result}")

elif operation == "/":
    # Step 5: Handle division by zero properly
    if num2 == 0:
        print("Error: Division by zero is not allowed.")
    else:
        result = num1 / num2
        print(f"Result: {num1} / {num2} = {result}")

else:
    # Handle invalid operator inputs gracefully
    print("Invalid operator! Please restart the program and choose +, -, *, or /.")
