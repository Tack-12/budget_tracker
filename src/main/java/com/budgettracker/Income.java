package com.budgettracker;

public class Income {
    private double amount;
    private String frequency; // "monthly", "yearly", "bi-monthly", etc.
    private String date;

    public Income() {}

    public Income(double amount, String frequency, String date) {
        this.amount = amount;
        this.frequency = frequency;
        this.date = date;
    }

    public double getMonthlyIncome() {
        if ("yearly".equalsIgnoreCase(frequency)) {
            return amount / 12;
        } else if ("bi-monthly".equalsIgnoreCase(frequency)) {
            return amount * 2;
        }
        return amount; // default monthly
    }

    // getters & setters
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
