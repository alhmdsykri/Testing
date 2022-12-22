namespace Sera.Application.Usecase
{
    public class FindLocationHandler : BaseHandler,
        IRequestHandler<FindLocationRequest, Response<IEnumerable<FindLocationResponse>>>
    {
        public FindLocationHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindLocationResponse>>> Handle(
            FindLocationRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindLocationResponse>>();
            IQueryable<SQL.Location> ? query = null;
            int[] locationTypeId = AppConst.LOCATION_TYPE_TO_USER;

            query = dbContext.Location
                             .AsNoTracking()
                             .Include(i => i.locationType)
                             .Where(x => (DRBAC.locations.Contains(x.locationId) ||
                                         !locationTypeId.Contains(x.locationTypeId)) &&
                                         x.status == (int)EventStatus.COMPLETED);

            if (!string.IsNullOrWhiteSpace(request.locationCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.locationCode,
                                                           $"%{request.locationCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.locationName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.locationName,
                                                           $"%{request.locationName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.locationTypeCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.locationType.locationTypeCode,
                                                           $"%{request.locationTypeCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.locationTypeName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.locationType.locationTypeName,
                                                           $"%{request.locationTypeName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.branchCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.branchCode,
                                                           $"%{request.branchCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.branchName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.branchName,
                                                           $"%{request.branchName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.locationAddress))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.locationAddress,
                                                           $"%{request.locationAddress}%"));
            }            

            var entity = await query.Select(s => new FindLocationResponse()
            {
                locationId = s.locationId,
                locationCode = s.locationCode,
                locationName = s.locationName,
                locationTypeId = s.locationTypeId,
                locationTypeCode = s.locationType.locationTypeCode,
                locationTypeName = s.locationType.locationTypeName,
                branchId = s.branchId,
                branchCode = s.branchCode,
                branchName = s.branchName,
                locationAddress = s.locationAddress,
                source = s.source
            }).ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Location"),
                                     request.page, request.row, 0, new List<FindLocationResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY LOCATION NAME)
            entity = entity.OrderBy(x => x.locationName).ToList();            

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortLocation.locationName)
            {
                entity = entity.OrderByDescending(x => x.locationName).ToList();
            }

            if (request.sortBy == SortLocation.locationCode)
            {
                if (request.orderBy == Order.DESC)
                { 
                    entity = entity.OrderByDescending(x => x.locationCode).ToList(); 
                }
                else
                { 
                    entity = entity.OrderBy(x => x.locationCode).ToList(); 
                }                
            }

            if (request.sortBy == SortLocation.locationTypeCode)
            {
                if (request.orderBy == Order.DESC)
                {
                    entity = entity.OrderByDescending(x => x.locationTypeCode).ToList();
                }
                else
                {
                    entity = entity.OrderBy(x => x.locationTypeCode).ToList();
                }
            }

            if (request.sortBy == SortLocation.locationTypeName)
            {
                if (request.orderBy == Order.DESC)
                {
                    entity = entity.OrderByDescending(x => x.locationTypeName).ToList();
                }
                else
                {
                    entity = entity.OrderBy(x => x.locationTypeName).ToList();
                }
            }

            if (request.sortBy == SortLocation.branchCode)
            {
                if (request.orderBy == Order.DESC)
                {
                    entity = entity.OrderByDescending(x => x.branchCode).ToList();
                }
                else
                {
                    entity = entity.OrderBy(x => x.branchCode).ToList();
                }
            }

            if (request.sortBy == SortLocation.branchName)
            {
                if (request.orderBy == Order.DESC)
                {
                    entity = entity.OrderByDescending(x => x.branchName).ToList();
                }
                else
                {
                    entity = entity.OrderBy(x => x.branchName).ToList();
                }
            }

            if (request.sortBy == SortLocation.locationAddress)
            {
                if (request.orderBy == Order.DESC)
                {
                    entity = entity.OrderByDescending(x => x.locationAddress).ToList();
                }
                else
                {
                    entity = entity.OrderBy(x => x.locationAddress).ToList();
                }
            }           

            var total = entity.Count;
            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Location"),
                                    request.page, request.row, total, entity);
        }
    }
}
