namespace Sera.Application.Usecase
{
    public class GetTripExpenseCategoryHandler : BaseHandler,
        IRequestHandler<GetTripExpenseCategoryRequest, Response<IEnumerable<GetTripExpenseCategoryResponse>>>
    {
        public GetTripExpenseCategoryHandler(IHttpContextAccessor httpContext, IDbContext dbContext)
            : base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<GetTripExpenseCategoryResponse>>> Handle(GetTripExpenseCategoryRequest request, 
                        CancellationToken cancellationToken)
        {
            Response<IEnumerable<GetTripExpenseCategoryResponse>> response = new();
            var entity = await dbContext.ProductExpense
                                         .Include(i => i.Expense)
                                         .AsNoTracking()
                                         .Where(x =>  x.productId == request.productId && x.status == (int)EventStatus.COMPLETED)
                                         .Select(x => new GetTripExpenseCategoryResponse()
                                         {
                                             expenseId = x.expenseId,
                                             expenseName = x.Expense.expenseName,
                                             expenseUnit = x.Expense.expenseUnit
                                         }).ToListAsync(cancellationToken: cancellationToken);

            if (entity.Count == 0)
            {
                return response.Fail(TransactionId, Message.NotFound("Trip Expense Category"), null);
            }
            return response.Success(TransactionId, Message.Found("Trip Expense Category"), entity);
        }
    }
}
