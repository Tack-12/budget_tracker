// BudgetProfile.java
package com.budgettracker;

import java.util.ArrayList;
import java.util.List;

public class BudgetProfile {
    private Income income;
    private List<Expense> expenses = new ArrayList<>();

    public BudgetProfile() {}

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
        return income != null ? income.getMonthlyIncome() - getTotalExpenses() : 0;
    }

    public Income getIncome() {
        return income;
    }

    public void setIncome(Income income) {
        this.income = income;
    }

    public List<Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses;
    }
}
