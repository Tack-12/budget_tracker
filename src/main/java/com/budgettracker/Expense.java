package com.budgettracker;

// Expense.java
public class Expense {
    private String category; // "housing", "food", etc.
    private double amount;

    public Expense(String category, double amount) {
        this.category = category;
        this.amount = amount;
    }

    // Getters and setters

    public double getAmount() {
        return amount;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCategory() {
        return category;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}


