using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using SQL = Sera.Entity.SQL;

namespace Sera.Persistance.SQLServer
{
    public class DBContext : DbContext, IDbContext
    {
        public DBContext(DbContextOptions options) : base(options)
        { }
        public DbSet<SQL.Route> Route { get; set; }
        public DbSet<SQL.RouteLocation> RouteLocation { get; set; }
        public DbSet<SQL.RouteAction> RouteAction { get; set; }
        public DbSet<SQL.TripExpense> TripExpense { get; set; }
        public DbSet<SQL.Revenue> Revenue { get; set; }
        public DbSet<SQL.ProductExpense> ProductExpense { get; set; }
        public DbSet<SQL.ExpenseValue> ExpenseValue { get; set; }
        public DbSet<SQL.Expense> Expense { get; set; }
        public DbSet<SQL.ActionDetail> ActionDetail { get; set; }
        public DbSet<SQL.ProductVehicleType> ProductVehicleType { get; set; }
        protected override void ConfigureConventions(ModelConfigurationBuilder builder)
        {
            builder.Properties<decimal>().HavePrecision(11, 8);
            builder.Properties<decimal>().HavePrecision(18, 0);
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
