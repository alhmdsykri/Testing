namespace Sera.Application.Usecase
{
    public class FindProductHandler : BaseHandler,
        IRequestHandler<FindProductRequest, Response<IEnumerable<FindProductResponse>>>
    {
        public FindProductHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindProductResponse>>> Handle(
            FindProductRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindProductResponse>>();
            IQueryable<SQL.Product>? query = null;

            query = dbContext.Product
                             .AsNoTracking()
                             .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId));

            switch (request.productSearchBy)
            {
                case SearchProductBy.productName:
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.productName,
                                                               $"%{request.productSearch}%") &&
                                                               (x.status == (int)EventStatus.COMPLETED || x.status == (int)EventStatus.DELETED && x.deletedAt > DateTime.Now));
                    break;
                case SearchProductBy.businessUnitCode:
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.businessUnitCode,
                                                               $"%{request.productSearch}%") &&
                                                               (x.status == (int)EventStatus.COMPLETED || x.status == (int)EventStatus.DELETED && x.deletedAt > DateTime.Now));
                    break;
                case SearchProductBy.businessUnitName:
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.businessUnitName,
                                                               $"%{request.productSearch}%") &&
                                                               (x.status == (int)EventStatus.COMPLETED || x.status == (int)EventStatus.DELETED && x.deletedAt > DateTime.Now));
                    break;
                case SearchProductBy.productType:
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like((string)(object)x.productTypeId,
                                                               $"%{request.productSearch}%") &&
                                                               (x.status == (int)EventStatus.COMPLETED || x.status == (int)EventStatus.DELETED && x.deletedAt > DateTime.Now));
                    break;
                case SearchProductBy.productStatus:
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like((string)(object)x.productStatus,
                                                                   $"%{request.productSearch}%") &&
                                                                   (x.status == (int)EventStatus.COMPLETED || x.status == (int)EventStatus.DELETED && x.deletedAt > DateTime.Now));
                    break;
                case SearchProductBy.journeyTypeId:
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like((string)(object)x.journeyTypeId,
                                                                   $"%{request.productSearch}%") &&
                                                                   (x.status == (int)EventStatus.COMPLETED || x.status == (int)EventStatus.DELETED && x.deletedAt > DateTime.Now));
                    break;
                default:
                    query = query.AsNoTracking()
                                 .Where(x => EF.Functions.Like(x.productName,
                                                               $"%{request.productSearch}%") &&
                                                               (x.status == (int)EventStatus.COMPLETED || x.status == (int)EventStatus.DELETED && x.deletedAt > DateTime.Now));
                    break;
            }

            var entity = await query.Select(s => new FindProductResponse()
            {
                productId = s.productId,
                productName = s.productName,
                businessUnitCode = s.businessUnitCode,
                businessUnitName = s.businessUnitName,
                productType = s.productTypeId == (int)ProductTypeId.Logistic ? "Logistic" :
                                s.productTypeId == (int)ProductTypeId.Transport ? "Transport" :
                                s.productTypeId == (int)ProductTypeId.Expedition ? "Expedition" : "",
                productStatus = s.deletedAt == null && s.productStatus == (int)ProductStatus.Active ? "Active" :
                                s.deletedAt == null && s.productStatus == (int)ProductStatus.Inactive ? "Inactive" :
                                s.deletedAt != null ? "Deleted in " + (s.deletedAt.Value.Date - DateTime.Now.Date).Days + " Day(s)": null,
                deletedAt = s.deletedAt,
                modifiedAt = s.modifiedAt
            }).Distinct().ToListAsync(cancellationToken: cancellationToken);

            if (entity.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Product"),
                                     request.page, request.row, 0, new List<FindProductResponse>());
            }

            //DEFAULT ORDER AND SORT (ASCENDING BY PRODUCT NAME)
            entity = entity.OrderByDescending(x => x.modifiedAt).ToList();

            if (request.sortBy == SortProduct.productType)
            {
                if (request.orderBy == Order.ASC)
                {
                    entity = entity.OrderBy(x => x.productType).ToList();
                }
                else
                {
                    entity = entity.OrderByDescending(x => x.productType).ToList();
                }
            }

            if (request.sortBy == SortProduct.productStatus)
            {
                if (request.orderBy == Order.ASC)
                {
                    entity = entity.OrderBy(x => x.productStatus).ToList();
                }
                else
                {
                    entity = entity.OrderByDescending(x => x.productStatus).ToList();
                }
            }

            var total = entity.Count;
            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            entity = entity.Skip((request.page - 1) * request.row)
                           .Take(request.row)
                           .ToList();

            return response.Success(TransactionId, Message.Found("Product"),
                                    request.page, request.row, total, entity);
        }
    }
}
