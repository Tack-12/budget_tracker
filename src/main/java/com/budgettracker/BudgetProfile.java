// BudgetProfile.java
package com.budgettracker;

import java.util.ArrayList;
import java.util.List;
import java.util.*;

public class BudgetProfile {
    private Income income;
    private List<Expense> expenses = new ArrayList<>();

    private Map<String, Double> allocations = new HashMap<>();

    public BudgetProfile() {}

    //INCOME
    public BudgetProfile(Income income) {
        this.income = income;
    }
    public Income getIncome() {
        return income;
    }
    public void setIncome(Income income) {
        this.income = income;
    }


    //EXPENSES
    public List<Expense> getExpenses() {
        return expenses;
    }
    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses;
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


    //allocations API
    public Map<String, Double> getAllocations() {
        return allocations;
    }
    public void setAllocations(Map<String, Double> allocations) {
        this.allocations = allocations;
    }
    public void setAllocation(String category, double amount) {
        allocations.put(category, amount);
    }

    //remaining per category
    public double getRemainingForCategory(String category) {
        double spent = expenses.stream()
                .filter(e -> e.getCategory().equals(category))
                .mapToDouble(Expense::getAmount)
                .sum();
        return allocations.getOrDefault(category, 0.0) - spent;
    }


}
