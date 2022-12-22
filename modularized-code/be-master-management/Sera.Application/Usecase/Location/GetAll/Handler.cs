using Sera.Application.Interface;
using Sera.Entity.SQL;

namespace Sera.Application.Usecase
{
    public class GetAllLocationHandler : BaseHandler,
        IRequestHandler<GetAllLocationRequest, Response<IEnumerable<GetAllLocationResponse>>>
    {
        public GetAllLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetAllLocationResponse>>> Handle(
            GetAllLocationRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<GetAllLocationResponse>>();
            IQueryable<SQL.Location>? query = null;
            int[] locationTypeId = AppConst.LOCATION_TYPE_TO_USER;

            query = dbContext.Location
                             .AsNoTracking()
                             .Include(i => i.locationType)
                             .Where(x => x.status == (int)EventStatus.COMPLETED &&
                                        !locationTypeId.Contains(x.locationTypeId));

            var entity = await query.Select(s => new GetAllLocationResponse()
            {
                locationId = s.locationId,
                locationCode = s.locationCode,
                locationName = s.locationName,
                locationTypeId = s.locationTypeId,
                locationTypeCode = s.locationType.locationTypeCode,
                locationTypeName = s.locationType.locationTypeName,
                businessUnitId = s.businessUnitId,
                businessUnitCode = s.businessUnitCode,
                businessUnitName = s.businessUnitName,
                branchId = s.branchId,
                branchCode = s.branchCode,
                branchName = s.branchName,
                locationAddress = s.locationAddress,
                source = s.source
            }).ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound(AppConst.LOCATION),
                                     request.page, request.row, 0, new List<GetAllLocationResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY LOCATION NAME)
            entity = entity.OrderBy(x => x.locationName).ToList();

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortLocation.locationName)
            {
                entity = entity.OrderByDescending(x => x.locationName).ToList();
            }

            if (request.orderBy == Order.ASC &&
              request.sortBy == SortLocation.locationCode)
            {
                entity = entity.OrderBy(x => x.locationCode).ToList();
            }

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortLocation.locationCode)
            {
                entity = entity.OrderByDescending(x => x.locationCode).ToList();
            }

            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            var maxPage = Math.Ceiling((decimal)total / (decimal)request.row);

            int nextPage = 0;

            if (request.page + 1 > maxPage)
            {
                nextPage = 0;
            }
            else
            {
                nextPage = request.page + 1;
            }

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            var data = entity.Adapt<IEnumerable<GetAllLocationResponse>>();
            return response.Success(TransactionId, Message.Found(AppConst.LOCATION),
                                    request.page, nextPage, request.row, total, data);
        }
    }
}