namespace Sera.Application.Interface
{
    public interface IDbContext
    {
        //ADD ENTITY DB SET PROPERTIES HERE
        DbSet<SQL.Company> Company { get; set; }
        DbSet<SQL.BusinessUnit> BusinessUnit { get; set; }
        DbSet<SQL.Region> Region { get; set; }
        DbSet<SQL.Branch> Branch { get; set; }
      
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
