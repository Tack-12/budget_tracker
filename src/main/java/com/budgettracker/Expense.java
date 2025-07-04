package com.budgettracker;

public class Expense {
    private String category;
    private double amount;
    private String notes;  // optional
    private String date;

    public Expense() {}

    public Expense(String category, double amount, String notes, String date) {
        this.category = category;
        this.amount   = amount;
        this.notes    = notes;
        this.date     = date;
    }

    // getters & setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
