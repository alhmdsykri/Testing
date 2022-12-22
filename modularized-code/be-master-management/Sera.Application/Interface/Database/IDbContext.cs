namespace Sera.Application.Interface
{
    public interface IDbContext
    {
        //ADD ENTITY DB SET PROPERTIES HERE
        DbSet<SQL.Customer> Customer { get; set; }
        DbSet<SQL.CustomerContract> CustomerContract { get; set; }
        DbSet<SQL.CustomerContact> CustomerContact { get; set; }
        DbSet<SQL.CustomerFunction> CustomerFunction { get; set; }
        DbSet<SQL.Location> Location { get; set; }
        DbSet<SQL.LocationType> LocationType { get; set; }
        DbSet<SQL.Vendor> Vendor { get; set; }
        DbSet<SQL.VendorContract> VendorContract { get; set; }
        DbSet<SQL.OrderCustomerDailySummary> OrderCustomerDailySummary { get; set; }
        DbSet<SQL.OrderCustomerMonthlySummary> OrderCustomerMonthlySummary { get; set; }
        DbSet<SQL.OrderCustomerYearlySummary> OrderCustomerYearlySummary { get; set; }
        DbSet<SQL.CustomerContractItem> CustomerContractItem { get; set; }
        DbSet<SQL.Material> Material { get; set; }
        DbSet<SQL.UOM> UOM { get; set; }
        DbSet<SQL.CustomerBusinessUnit> CustomerBusinessUnit { get; set; }
        DbSet<SQL.Product> Product { get; set; }
        Task<int> GenerateCode(string sequenceName);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);        
    }
}
