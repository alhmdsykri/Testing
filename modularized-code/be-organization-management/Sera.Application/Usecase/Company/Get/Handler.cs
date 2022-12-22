namespace Sera.Application.Usecase
{
    public class GetCompanyHandler : BaseHandler,
        IRequestHandler<GetCompanyRequest, Response<GetCompanyResponse>>
    {
        public GetCompanyHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<GetCompanyResponse>> Handle(
            GetCompanyRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<GetCompanyResponse>();

            var entity = await dbContext.Company
                                        .AsNoTracking()
                                        .Include(x => x.parentCompany)
                                        .Where(x => x.companyId == request.companyId)
                                        .FirstOrDefaultAsync();

            if (entity == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Company"), null);
            }

            #region Get CHILD COMPANY
            var childCompany = await dbContext.Company
                                              .AsNoTracking()
                                              .Where(x => x.parentCompanyId == entity.companyId)
                                              .ToListAsync(cancellationToken: cancellationToken);

            if (!childCompany.IsEmpty())
            {
                #region RECURSIVE
                CompanyFunction funcCompany = new(dbContext);

                var childId = childCompany.Select(x => (short?)x.companyId).Distinct();
                var gcc = await funcCompany.GenerateChildCompany(childId, cancellationToken);

                if (!gcc.IsEmpty())
                {
                    childCompany.ForEach(x =>
                    {
                        x.childCompany = gcc.Where(y => y.parentCompanyId == x.companyId).ToList();
                    });
                }
                #endregion

                entity.childCompany = childCompany;
            }
            #endregion

            var data = entity.Adapt<GetCompanyResponse>();
            return response.Success(TransactionId, Message.Found("Company"), data);
        }
    }
}
