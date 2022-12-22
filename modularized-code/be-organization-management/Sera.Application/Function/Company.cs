namespace Sera.Application.Function
{
    internal class CompanyFunction
    {
        private readonly IDbContext dbContext;
        internal CompanyFunction(IDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        internal async Task<List<SQL.Company>> GenerateChildCompany(
            IEnumerable<short?> listParentId, CancellationToken cancellationToken)
        {
            List<SQL.Company> result = new();

            //gcCompany/result stands for grand child company, sorry for the lazyness :p
            result = await dbContext.Company
                                    .AsNoTracking()
                                    .Where(x => listParentId.Contains(x.parentCompanyId))
                                    .ToListAsync(cancellationToken: cancellationToken);

            if (!result.IsEmpty())
            {
                var subParentId = result.Select(x => (short?)x.companyId)
                                        .Distinct()
                                        .ToList();

                //ggcCompany means, grand-grand child company...duh!!!
                var ggcCompany = await GenerateChildCompany(subParentId, cancellationToken);

                if (!ggcCompany.IsEmpty())
                {
                    foreach (var gc in result)
                    {
                        gc.childCompany = ggcCompany.Where(x => x.parentCompanyId == gc.companyId)
                                                    .ToList();
                    }
                }
            }

            return result;
        }
    }
}
