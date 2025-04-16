// Expense.java
package com.budgettracker;

public class Expense {
    private String category; // e.g., "housing", "food", etc.
    private double amount;

    public Expense() {}

    public Expense(String category, double amount) {
        this.category = category;
        this.amount = amount;
    }

    // Getters and setters
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}
