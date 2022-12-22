namespace Sera.Application.Usecase
{
    public class FindTripExpenseHandler : BaseHandler,
        IRequestHandler<FindTripExpenseRequest, Response<IEnumerable<FindTripExpenseResponse>>>
    {
        public FindTripExpenseHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindTripExpenseResponse>>> Handle(
            FindTripExpenseRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindTripExpenseResponse>>();
            IQueryable<SQL.TripExpense>? query;

            query = dbContext.TripExpense
                             .Include(y => y.ProductVehicleType)
                             .AsNoTracking()
                             .Where(x => x.routeId == request.routeId && DRBAC.businessUnits.Contains(x.businessUnitId) && x.status == (int)EventStatus.COMPLETED);

            if (!string.IsNullOrWhiteSpace(request.vehicleTypeCode))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like((string)(object)x.ProductVehicleType.vehicleTypeCode,
                                                                   $"%{request.vehicleTypeCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.vehicleTypeName))
            {
                query = query.AsNoTracking()
                                     .Where(x => EF.Functions.Like(x.ProductVehicleType.vehicleTypeName,
                                                                   $"%{request.vehicleTypeName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.uomCode))
            {
                string[] uomCodePhrase = request.uomCode.Split(';');
                query = query.AsNoTracking()
                                     .Where(x => uomCodePhrase.Contains(x.ProductVehicleType.uomCode));
            }
            else
            {
                return response.Fail(TransactionId, Message.NotFound("Trip Expense List"),
                                     request.page, request.row, 0, new List<FindTripExpenseResponse>());
            }

            var entity = await query.Select(s => new FindTripExpenseResponse()
            {
                tripExpenseId = s.tripExpenseId,
                vehicleTypeCode = s.ProductVehicleType.vehicleTypeCode,
                vehicleTypeName = s.ProductVehicleType.vehicleTypeName,
                totalExpense = s.totalExpense,
                revenue = s.Revenue.revenue,
                COGS = s.Revenue.COGS,
                uomCode = s.ProductVehicleType.uomCode
            }).Distinct().ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Trip Expense List"),
                                     request.page, request.row, 0, new List<FindTripExpenseResponse>());
            }

            //DEFAULT ORDER AND SORT (DESCENDING BY LAST UPDATE)
            entity = entity.OrderBy(x => x.vehicleTypeCode).ToList();

            if (request.sortBy == SortTripExpense.vehicleTypeName)
            {
                if (request.orderBy == Order.ASC)
                {
                    entity = entity.OrderBy(x => x.vehicleTypeName).ToList();
                }
                else
                {
                    entity = entity.OrderByDescending(x => x.vehicleTypeName).ToList();
                }
            }

            if (request.sortBy == SortTripExpense.uomCode)
            {
                if (request.orderBy == Order.ASC)
                {
                    entity = entity.OrderBy(x => x.uomCode).ToList();
                }
                else
                {
                    entity = entity.OrderByDescending(x => x.uomCode).ToList();
                }
            }
          
            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Trip Expense List"),
                                    request.page, request.row, total, entity);
        }
    }
}