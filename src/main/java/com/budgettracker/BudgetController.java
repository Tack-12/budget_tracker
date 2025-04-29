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
        Map<String,Object> resp = new HashMap<>();
        resp.put("message", "Income set successfully");
        resp.put("monthlyIncome", income.getMonthlyIncome());
        resp.put("incomeDate", income.getDate());
        return resp;
    }

    @PostMapping("/expense")
    public Map<String,Object> addExpense(@RequestBody Expense expense) {
        if (profile.getIncome() == null) {
            return Map.of("error", "Please set income first");
        }
        profile.addExpense(expense);
        return Map.of("message", "Expense added successfully");
    }

    @PostMapping("/recurring")
    public Map<String,Object> addRecurring(@RequestBody RecurringExpense r) {
        // store subscription
        profile.addRecurring(r);
        // immediately apply it as an expense (flagged)
        profile.addExpense(new Expense(
                r.getCategory(),
                r.getAmount(),
                (r.getNotes() != null && !r.getNotes().isEmpty()
                        ? r.getNotes() + " (recurring)"
                        : "(recurring)"),
                r.getLastApplied()
        ));
        return Map.of("message", "Recurring expense added and applied");
    }

    @GetMapping("/summary")
    public Map<String,Object> getSummary() {
        try { profile.applyRecurrings(); } catch (Exception ignored) {}

        Map<String,Object> resp = new HashMap<>();
        resp.put("monthlyIncome",
                profile.getIncome() != null
                        ? profile.getIncome().getMonthlyIncome()
                        : 0
        );
        resp.put("incomeDate",
                profile.getIncome() != null
                        ? profile.getIncome().getDate()
                        : ""
        );
        resp.put("totalExpenses",   profile.getTotalExpenses());
        resp.put("remainingBudget", profile.getRemainingBudget());
        resp.put("expenses",        profile.getExpenses());
        return resp;
    }

    @DeleteMapping("/expense/{index}")
    public Map<String,Object> deleteExpense(@PathVariable int index) {
        profile.getExpenses().remove(index);
        return Map.of("message", "Expense removed");
    }

    @DeleteMapping("/income")
    public Map<String,Object> deleteIncome() {
        profile.setIncome(null);
        profile.getExpenses().clear();
        return Map.of("message", "Income cleared");
    }
}
