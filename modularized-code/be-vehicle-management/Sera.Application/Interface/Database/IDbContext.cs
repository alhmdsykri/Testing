namespace Sera.Application.Interface
{
    public interface IDbContext
    {
        //ADD ENTITY DB SET PROPERTIES HERE
        DbSet<SQL.FuelType> FuelType { get; set; }
        DbSet<SQL.MovementLog> MovementLog { get; set; }
        DbSet<SQL.Vehicle> Vehicle { get; set; }
        DbSet<SQL.VehicleBrand> VehicleBrand { get; set; }
        DbSet<SQL.VehicleCategory> VehicleCategory { get; set; }
        DbSet<SQL.VehicleColor> VehicleColor { get; set; }
        DbSet<SQL.VehicleModel> VehicleModel { get; set; }
        DbSet<SQL.VehicleType> VehicleType { get; set; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
