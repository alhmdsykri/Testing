namespace Sera.Application.Usecase
{
    public class FindRegionHandler : BaseHandler,
        IRequestHandler<FindRegionRequest, Response<IEnumerable<FindRegionResponse>>>
    {
        public FindRegionHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindRegionResponse>>> Handle(
            FindRegionRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindRegionResponse>>();

            #region Check if exists
            var entity = await dbContext.Region
                                        .AsNoTracking()
                                        .Where(x => EF.Functions.Like(x.regionName, $"%{request.regionName}%")
                                                    && x.status == (int)EventStatus.COMPLETED)
                                        .ToListAsync(cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Region"),
                                     request.page, request.row, 0, new List<FindRegionResponse>());
            }
            #endregion

            //DEFAULT ORDER AND SORT (ASCENDING BY COMPANY NAME)
            entity = entity.OrderBy(x => x.regionName).ToList();

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortRegion.regionName)
            {
                entity = entity.OrderByDescending(x => x.regionName).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortRegion.regionName)
            {
                entity = entity.OrderBy(x => x.regionName).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortRegion.regionName)
            {
                entity = entity.OrderByDescending(x => x.regionName).ToList();
            }

            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            var data = entity.Adapt<IEnumerable<FindRegionResponse>>();
            return response.Success(TransactionId, Message.Found("Region"),
                                    request.page, request.row, total, data);
        }
    }
}
