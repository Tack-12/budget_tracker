package com.budgettracker;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BudgetProfile {
    private Income income;
    private List<Expense> expenses = new ArrayList<>();
    private List<RecurringExpense> recurrings = new ArrayList<>();

    public BudgetProfile() {}
    public BudgetProfile(Income income) { this.income = income; }

    public void setIncome(Income income) { this.income = income; }
    public Income getIncome() { return income; }

    public void addExpense(Expense e) { expenses.add(e); }
    public List<Expense> getExpenses() { return expenses; }
    public void setExpenses(List<Expense> expenses) { this.expenses = expenses; }

    public double getTotalExpenses() {
        return expenses.stream().mapToDouble(Expense::getAmount).sum();
    }

    public double getRemainingBudget() {
        return income != null
                ? income.getMonthlyIncome() - getTotalExpenses()
                : 0;
    }

    public void addRecurring(RecurringExpense r) {
        recurrings.add(r);
    }

    /**
     * Once-per-month, auto-apply any monthly recurring expenses.
     */
    public void applyRecurrings() {
        LocalDate now = LocalDate.now();
        for (RecurringExpense r : recurrings) {
            String lastStr = r.getLastApplied();
            if (lastStr == null) continue;
            try {
                LocalDate last = LocalDate.parse(lastStr);
                if (last.getYear() != now.getYear() || last.getMonth() != now.getMonth()) {
                    int day = Math.min(last.getDayOfMonth(), now.lengthOfMonth());
                    String newDate = now.withDayOfMonth(day).toString();
                    expenses.add(new Expense(
                            r.getCategory(),
                            r.getAmount(),
                            r.getNotes(),
                            newDate
                    ));
                    r.setLastApplied(newDate);
                }
            } catch (Exception ex) {
                // ignore parse errors
            }
        }
    }
}
