// Income.java
package com.budgettracker;

public class Income {
    private double amount;
    private String frequency; // "monthly", "yearly", "bi-monthly", etc.

    public Income() {}

    public Income(double amount, String frequency) {
        this.amount = amount;
        this.frequency = frequency;
    }

    public double getMonthlyIncome() {
        if ("yearly".equalsIgnoreCase(frequency)) {
            return amount / 12;
        } else if ("bi-monthly".equalsIgnoreCase(frequency)) {
            return amount * 2;
        }
        // Default assumes monthly
        return amount;
    }

    // Getters and setters
    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }
}
