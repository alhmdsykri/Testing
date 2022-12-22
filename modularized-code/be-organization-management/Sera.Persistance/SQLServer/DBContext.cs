using Microsoft.EntityFrameworkCore;
using Sera.Entity.SQL;

namespace Sera.Persistance.SQLServer
{
    public class DBContext : DbContext, IDbContext
    {
        public DBContext(DbContextOptions options) : base(options)
        { }

        public DbSet<Company> Company { get; set; }
        public DbSet<BusinessUnit> BusinessUnit { get; set; }
        public DbSet<Region> Region { get; set; }
        public DbSet<Branch> Branch { get; set; }
    }
}
