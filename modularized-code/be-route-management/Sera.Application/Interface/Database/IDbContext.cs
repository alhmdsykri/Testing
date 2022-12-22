namespace Sera.Application.Interface
{
    public interface IDbContext
    {
        //ADD ENTITY DB SET PROPERTIES HERE

        DbSet<SQL.Route> Route { get; set; }
        DbSet<SQL.RouteLocation> RouteLocation { get; set; }
        DbSet<SQL.RouteAction> RouteAction { get; set; }
        DbSet<SQL.ActionDetail> ActionDetail { get; set; }
        DbSet<SQL.Expense> Expense { get; set; }
        DbSet<SQL.ProductExpense> ProductExpense { get; set; }
        DbSet<SQL.ExpenseValue> ExpenseValue { get; set; }
        DbSet<SQL.Revenue> Revenue { get; set; }
        DbSet<SQL.TripExpense> TripExpense { get; set; }
        DbSet<SQL.ProductVehicleType> ProductVehicleType { get; set; }

        Task<int> GenerateCode(string sequenceName);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
