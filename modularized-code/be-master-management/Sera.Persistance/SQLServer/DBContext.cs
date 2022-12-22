using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using SQL = Sera.Entity.SQL;

namespace Sera.Persistance.SQLServer
{
    public class DBContext : DbContext, IDbContext
    {
        public DBContext(DbContextOptions options) : base(options)
        { }
        public DbSet<SQL.Customer> Customer { get; set; }
        public DbSet<SQL.CustomerContract> CustomerContract { get; set; }
        public DbSet<SQL.CustomerContact> CustomerContact { get; set; }
        public DbSet<SQL.CustomerFunction> CustomerFunction { get; set; }
        public DbSet<SQL.Location> Location { get; set; }
        public DbSet<SQL.LocationType> LocationType { get; set; }
        public DbSet<SQL.Vendor> Vendor { get; set; }
        public DbSet<SQL.VendorContract> VendorContract { get; set; }
        public DbSet<SQL.OrderCustomerDailySummary> OrderCustomerDailySummary { get; set; }
        public DbSet<SQL.OrderCustomerMonthlySummary> OrderCustomerMonthlySummary { get; set; }
        public DbSet<SQL.OrderCustomerYearlySummary> OrderCustomerYearlySummary { get; set; }
        public DbSet<SQL.CustomerContractItem> CustomerContractItem { get; set; }
        public DbSet<SQL.Material> Material { get; set; }
        public DbSet<SQL.UOM> UOM { get; set; }
        public DbSet<SQL.CustomerBusinessUnit> CustomerBusinessUnit { get; set; }
        public DbSet<SQL.Product> Product { get; set; }

        protected override void ConfigureConventions(ModelConfigurationBuilder builder)
        {
            builder.Properties<decimal>().HavePrecision(11, 8);
        }

        public async Task<int> GenerateCode(string sequenceName)
        {
            var result = new SqlParameter("@result", System.Data.SqlDbType.Int)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            _ = await Database.ExecuteSqlRawAsync($"SET @result = NEXT VALUE FOR {sequenceName}", result);
            var nextSequence = (int)result.Value;

            return nextSequence;
        }
    }
}
