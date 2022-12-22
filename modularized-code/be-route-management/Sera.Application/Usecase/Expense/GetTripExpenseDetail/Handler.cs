namespace Sera.Application.Usecase
{
    public class GetTripExpenseDetailHandler : BaseHandler, IRequestHandler<GetTripExpenseDetailRequest, Response<GetTripExpenseDetailResponse>>
    {
        public GetTripExpenseDetailHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<GetTripExpenseDetailResponse>> Handle(GetTripExpenseDetailRequest request, CancellationToken cancellationToken)
        {
            Response<GetTripExpenseDetailResponse> response = new();
            GetTripExpenseDetailResponse data = new();
            var entityTripExpense = await dbContext.TripExpense
                                         .Include(y => y.ProductVehicleType)
                                         .AsNoTracking()
                                         .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId) && x.tripExpenseId == request.tripExpenseId && x.status == (int)EventStatus.COMPLETED) 
                                         .Select(x => new GetTripExpenseDetailResponse()
                                         {
                                             tripExpenseId = x.tripExpenseId,
                                             productId = x.ProductVehicleType.productId,
                                             vehicleTypeId = x.ProductVehicleType.vehicleTypeId,
                                             vehicleTypeCode = x.ProductVehicleType.vehicleTypeCode,
                                             vehicleTypeName = x.ProductVehicleType.vehicleTypeName,
                                             totalExpense = x.totalExpense,
                                             revenue = x.Revenue.revenue,
                                             COGS = x.Revenue.COGS,
                                             uomCode = x.ProductVehicleType.uomCode
                                         }).FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (entityTripExpense == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Trip Expense Detail"), null);
            }

            data.tripExpenseId = entityTripExpense.tripExpenseId;
            data.productId = entityTripExpense.productId;
            data.vehicleTypeId = entityTripExpense.vehicleTypeId;
            data.vehicleTypeCode = entityTripExpense.vehicleTypeCode;
            data.vehicleTypeName = entityTripExpense.vehicleTypeName;
            data.totalExpense = (decimal)entityTripExpense.totalExpense;
            data.revenue = (decimal)entityTripExpense.revenue;
            data.COGS = (decimal)entityTripExpense.COGS;
            data.uomCode = entityTripExpense.uomCode;

            var entityCategoryValues = await dbContext.ExpenseValue
                                         .AsNoTracking()
                                         .Where(x => x.tripExpenseid == request.tripExpenseId && x.status == (int)EventStatus.COMPLETED)
                                         .Select(x => new ExpenseCategory()
                                         {
                                             expenseCategoryId = x.expenseId,
                                             values = x.value
                                         }).ToListAsync(cancellationToken: cancellationToken);

            if (!entityCategoryValues.IsEmpty())
            {
                data.expenseCategory = entityCategoryValues
                                      .Select(x => new ExpenseCategory
                                      {
                                          expenseCategoryId = x.expenseCategoryId,
                                          values = x.values
                                      }).ToList();
            }

            return response.Success(TransactionId, Message.Found("Trip Expense Detail"), data);
        }
    }
}