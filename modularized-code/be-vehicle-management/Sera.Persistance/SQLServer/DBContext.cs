using Microsoft.EntityFrameworkCore;
using Sera.Entity.SQL;

namespace Sera.Persistance.SQLServer
{
    public class DBContext : DbContext, IDbContext
    {
        public DBContext(DbContextOptions options) : base(options)
        { }

        public DbSet<FuelType> FuelType { get; set; }
        public DbSet<MovementLog> MovementLog { get; set; }
        public DbSet<Vehicle> Vehicle { get; set; }
        public DbSet<VehicleBrand> VehicleBrand { get; set; }
        public DbSet<VehicleCategory> VehicleCategory { get; set; }
        public DbSet<VehicleColor> VehicleColor { get; set; }
        public DbSet<VehicleModel> VehicleModel { get; set; }
        public DbSet<VehicleType> VehicleType { get; set; }

        protected override void ConfigureConventions(ModelConfigurationBuilder builder)
        {
            builder.Properties<decimal>().HavePrecision(11, 8);
        }
    }
}
