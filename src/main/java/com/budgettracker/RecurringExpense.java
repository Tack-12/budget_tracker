package com.budgettracker;

public class RecurringExpense {
    private String category;
    private double amount;
    private String notes;
    private String frequency;   // e.g. "monthly"
    private String lastApplied; // YYYY-MM-DD

    public RecurringExpense() {}

    public RecurringExpense(String category, double amount, String notes,
                            String frequency, String lastApplied) {
        this.category    = category;
        this.amount      = amount;
        this.notes       = notes;
        this.frequency   = frequency;
        this.lastApplied = lastApplied;
    }

    // getters & setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getLastApplied() { return lastApplied; }
    public void setLastApplied(String lastApplied) { this.lastApplied = lastApplied; }
}
