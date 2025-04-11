package com.budgettracker;

// BudgetProfile.java
import java.util.*;

public class BudgetProfile {
    private Income income;
    private List<Expense> expenses = new ArrayList<>();

    public BudgetProfile(Income income) {
        this.income = income;
    }

    public void addExpense(Expense expense) {
        expenses.add(expense);
    }

    public double getTotalExpenses() {
        return expenses.stream().mapToDouble(Expense::getAmount).sum();
    }

    public double getRemainingBudget() {
        return income.getMonthlyIncome() - getTotalExpenses();
    }

    public List<Expense> getExpenses() {
        return expenses;
    }

    public Income getIncome() {
        return income;
    }

    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses;
    }

    public void setIncome(Income income) {
        this.income = income;
    }
}
