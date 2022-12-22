namespace Sera.Application.Usecase
{
    public class FindVendorHandler : BaseHandler,
        IRequestHandler<FindVendorRequest, Response<IEnumerable<FindVendorResponse>>>
    {
        public FindVendorHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindVendorResponse>>> Handle(
            FindVendorRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindVendorResponse>>();

            IQueryable<SQL.Vendor> ? query ;            

            if (request.vendorSearchBy == SearchVendorBy.vendorCode)
            {
                query = dbContext.Vendor
                                 .AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.vendorCode,
                                                               $"%{request.vendorSearch}%") &&
                                                               x.status == (int)EventStatus.COMPLETED);
            }
            else
            {
                query = dbContext.Vendor
                                 .AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.vendorName,
                                                               $"%{request.vendorSearch}%") &&
                                                               x.status == (int)EventStatus.COMPLETED);
            }
           
            var entity = await query.Select(s => new FindVendorResponse()
            {
                vendorId = s.vendorId,
                vendorCode = s.vendorCode,
                vendorName = s.vendorName,
                modifiedAt = s.modifiedAt
            }).ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Vendor"),
                                     request.page, request.row, 0, new List<FindVendorResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY LOCATION NAME)
            entity = entity.OrderBy(x => x.vendorName).ToList();

            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Vendor"),
                                    request.page, request.row, total, entity);
        }
    }
}