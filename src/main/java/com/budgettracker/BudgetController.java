package com.budgettracker;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")
public class BudgetController {

    private BudgetProfile profile = new BudgetProfile();

    @PostMapping("/income")
    public Map<String,Object> setIncome(@RequestBody Income income) {
        profile.setIncome(income);
        return Map.of(
                "message","Income set successfully",
                "monthlyIncome", income.getMonthlyIncome(),
                "incomeDate", income.getDate()
        );
    }

    @PostMapping("/expense")
    public Map<String,Object> addExpense(@RequestBody Expense expense) {
        if (profile.getIncome() == null) {
            return Map.of("error", "Please set income first");
        }
        profile.addExpense(expense);
        return Map.of("message", "Expense added successfully");
    }

    @GetMapping("/summary")
    public Map<String,Object> getSummary() {
        // apply any due recurrings
        profile.applyRecurrings();

        return Map.of(
                "monthlyIncome",   profile.getIncome() != null ? profile.getIncome().getMonthlyIncome() : 0,
                "incomeDate",      profile.getIncome() != null ? profile.getIncome().getDate() : null,
                "totalExpenses",   profile.getTotalExpenses(),
                "remainingBudget", profile.getRemainingBudget(),
                "expenses",        profile.getExpenses()
        );
    }

    @DeleteMapping("/expense/{index}")
    public Map<String,Object> deleteExpense(@PathVariable int index) {
        profile.getExpenses().remove(index);
        return Map.of("message","Expense removed");
    }

    @DeleteMapping("/income")
    public Map<String,Object> deleteIncome() {
        profile.setIncome(null);
        profile.getExpenses().clear();
        return Map.of("message","Income cleared");
    }

    @PostMapping("/recurring")
    public Map<String,Object> addRecurring(@RequestBody RecurringExpense r) {
        profile.addRecurring(r);
        return Map.of("message","Recurring expense added");
    }

    @GetMapping("/recurring")
    public Map<String,Object> getRecurrings() {
        return Map.of("recurrings", profile.getRecurrings());
    }

    @DeleteMapping("/recurring/{index}")
    public Map<String,Object> deleteRecurring(@PathVariable int index) {
        profile.getRecurrings().remove(index);
        return Map.of("message","Recurring removed");
    }
}
