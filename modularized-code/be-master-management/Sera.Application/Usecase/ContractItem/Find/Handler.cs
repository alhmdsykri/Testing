namespace Sera.Application.Usecase
{
    public class FindContractItemHandler : BaseHandler,
        IRequestHandler<FindContractItemRequest, Response<IEnumerable<FindContractItemResponse>>>
    {
        public FindContractItemHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindContractItemResponse>>> Handle(
            FindContractItemRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindContractItemResponse>>();

            IQueryable<SQL.CustomerContractItem> query = null;

            query = dbContext.CustomerContractItem
                             .AsNoTracking()
                             .Where(x => x.status == (int)EventStatus.COMPLETED);

            if (request.contractId > 0)
            {
                query = query.AsNoTracking()
                             .Where(x => x.customerContractId == request.contractId);
            }

            if (!string.IsNullOrWhiteSpace(request.materialCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.Material.materialCode,
                                                           $"%{request.materialCode}%"));
            }


            if (!string.IsNullOrWhiteSpace(request.materialName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.Material.materialName,
                                                           $"%{request.materialName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.vehicleTypeCode))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.Material.vehicleTypeCode,
                                                           $"%{request.vehicleTypeCode}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.vehicleTypeName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.Material.vehicleTypeName,
                                                           $"%{request.vehicleTypeName}%"));
            }

            if ((request.lineItemNumber).HasValue)
            {
                query = query.AsNoTracking()
                             .Where(x => x.lineItemNumber == request.lineItemNumber);
            }

            if ((request.numberOfDriver).HasValue)
            {
                query = query.AsNoTracking()
                             .Where(x => x.numberOfDriver == request.numberOfDriver);
            }

            if ((request.quantity).HasValue)
            {
                query = query.AsNoTracking()
                             .Where(x => x.quantity == request.quantity);
            }

            if (!string.IsNullOrWhiteSpace(request.UOMCode))
            {
                query = query.AsNoTracking()
                             .Where(x => x.UOMCode == request.UOMCode);
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

            var entity = await query.Select(x => new FindContractItemResponse()
            {
                customerContractItemId = x.customerContractItemId,
                materialCode = x.Material.materialCode,
                materialName = x.Material.materialName,
                vehicleTypeCode = x.Material.vehicleTypeCode,
                vehicleTypeName = x.Material.vehicleTypeName,
                lineItemNumber = x.lineItemNumber,
                numberOfDriver = x.numberOfDriver,
                quantity = (decimal)x.quantity,
                UOMCode = x.UOMCode,
                branchCode = x.branchCode,
                branchName = x.branchName

            }).ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Contract Item"),
                                     request.page, request.row, 0, new List<FindContractItemResponse>());
            }

            //DEFAULT ORDER (ASCENDING BY MATERIAL CODE)
            entity = entity.OrderBy(x => x.materialCode).ToList();

            var total = entity.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Contract Item"),
                                    request.page, request.row, total, entity);
        }
    }
}