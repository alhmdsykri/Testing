namespace Sera.Application.Usecase
{
    public class FindRouteHandler : BaseHandler,
        IRequestHandler<FindRouteRequest, Response<IEnumerable<FindRouteResponse>>>
    {
        public FindRouteHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindRouteResponse>>> Handle(
            FindRouteRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindRouteResponse>>();
            IQueryable<SQL.Route>? query;

            query = dbContext.Route
                             .AsNoTracking()
                             .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) && x.status == (int)EventStatus.COMPLETED);

            if (!string.IsNullOrWhiteSpace(request.routeCode))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like((string)(object)x.routeCode,
                                                                   $"%{request.routeCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.routeName))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like(x.routeName,
                                                                   $"%{request.routeName}%"));
            }
            if (!string.IsNullOrWhiteSpace(request.departurePoolCode))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like(x.departurePoolCode,
                                                                   $"%{request.departurePoolCode}%"));
            }
            
            if (!string.IsNullOrWhiteSpace(request.departurePoolName))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like(x.departurePoolName,
                                                                   $"%{request.departurePoolName}%"));
            }
            
            if (!string.IsNullOrWhiteSpace(request.customerCode))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like(x.customerCode,
                                                                   $"%{request.customerCode}%"));
            }
            
            if (!string.IsNullOrWhiteSpace(request.customerName))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like(x.customerName,
                                                                   $"%{request.customerName}%"));
            }
            
            if (!string.IsNullOrWhiteSpace(request.contractNumber))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like(x.contractNumber,
                                                                   $"%{request.contractNumber}%"));
            }
            
            if (!string.IsNullOrWhiteSpace(request.returnRouteCode))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like((string)(object)x.returnRouteCode,
                                                                   $"%{request.returnRouteCode}%"));
            }
            
            if (!string.IsNullOrWhiteSpace(request.returnRouteName))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like(x.returnRouteName,
                                                                   $"%{request.returnRouteName}%"));
            }
            
            if (request.completionStatus.HasValue)
            {
                query = query.AsNoTracking()
                            .Where(x => x.completionStatus == request.completionStatus);
            }

            if (request.arrivalPoolId.HasValue)
            {
                query = query.AsNoTracking()
                            .Where(x => x.arrivalPoolId == request.arrivalPoolId);
            }

            if (request.departurePoolId.HasValue)
            {
                query = query.AsNoTracking()
                            .Where(x => x.departurePoolId == request.departurePoolId);
            }

            var entity = await query.Select(s => new FindRouteResponse()
            {
                routeId = s.routeId,
                routeCode = s.routeCode,
                routeName = s.routeName,
                departurePoolId = s.departurePoolId,
                departurePoolCode = s.departurePoolCode,
                departurePoolName = s.departurePoolName,
                customerId = s.customerId,
                customerCode = s.customerCode,
                customerName = s.customerName,
                contractNumber = s.contractNumber,
                returnRouteId = s.returnRouteId,
                returnRouteCode = s.returnRouteCode,
                returnRouteName = s.returnRouteName,
                completionStatus = s.completionStatus == (int)CompletionStatus.COMPLETED ? "Completed" :
                                   s.completionStatus == (int)CompletionStatus.INPROGRESS ? "In Progress" :
                                   s.completionStatus == (int)CompletionStatus.INCOMPLETED ? "Incomplete" :
                                   s.completionStatus == (int)CompletionStatus.PENDING_APPROVAL ? "Pending Approval" : "",
                lastUpdate = s.lastUpdate,
                modifiedAt = s.modifiedAt
            }).Distinct().ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Route"),
                                     request.page, request.row, 0, new List<FindRouteResponse>());
            }

            //DEFAULT ORDER AND SORT (DESCENDING BY LAST UPDATE)
            entity = entity.OrderByDescending(x => x.modifiedAt).ToList();            

            if (request.sortBy == SortRoute.customerCode)
            {
                if (request.orderBy == Order.ASC)
                {
                    entity = entity.OrderBy(x => x.customerCode).ToList();
                }
                else
                {
                    entity = entity.OrderByDescending(x => x.customerCode).ToList();
                }                
            }

            if (request.sortBy == SortRoute.customerName)
            {
                if (request.orderBy == Order.ASC)
                {
                    entity = entity.OrderBy(x => x.customerName).ToList();
                }
                else
                {
                    entity = entity.OrderByDescending(x => x.customerName).ToList();
                }
            }

            if (request.sortBy == SortRoute.completionStatus)
            {
                if (request.orderBy == Order.ASC)
                {
                    entity = entity.OrderBy(x => x.completionStatus).ToList();
                }
                else
                {
                    entity = entity.OrderByDescending(x => x.completionStatus).ToList();
                }
            }

            var total = entity.Count;
            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Route"),
                                    request.page, request.row, total, entity);
        }
    }
}
