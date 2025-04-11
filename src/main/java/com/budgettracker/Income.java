package com.budgettracker;

// Income.java
public class Income {
    private double amount;
    private String frequency; // "bi-monthly", "monthly", "yearly"

    public Income(double amount, String frequency) {
        this.amount = amount;
        this.frequency = frequency;
    }

    public double getMonthlyIncome() {
        switch (frequency) {
            case "yearly": return amount / 12;
            case "bi-monthly": return amount * 2;
            default: return amount;
        }
    }

    // Getters and setters


    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getFrequency() {
        return frequency;
    }
}
