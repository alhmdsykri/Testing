using System.Linq;

namespace Sera.Application.Usecase
{
    public class FindVendorContractHandler : BaseHandler,
        IRequestHandler<FindVendorContractRequest, Response<IEnumerable<FindVendorContractResponse>>>
    {
        public FindVendorContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext) :
            base(httpContext, dbContext)
        { }

        public async Task<Response<IEnumerable<FindVendorContractResponse>>> Handle(
            FindVendorContractRequest request, CancellationToken cancellationToken)
        {
            var response = new Response<IEnumerable<FindVendorContractResponse>>();
            int total;

            IQueryable<SQL.VendorContract>? query;

            query = dbContext.VendorContract
                             .AsNoTracking()
                             .Include(i => i.vendor)
                             .Where(x => DRBAC.businessUnits.Contains(x.businessUnitId.Value) &&
                                    x.status == (int)EventStatus.COMPLETED);

            if (!string.IsNullOrWhiteSpace(request.VMDNo))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.vendor.vendorCode,
                                                           $"%{request.VMDNo}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.vendorName))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.vendor.vendorName,
                                                           $"%{request.vendorName}%"));
            }

            if (!string.IsNullOrWhiteSpace(request.vendorContractNumber))
            {
                query = query.AsNoTracking()
                             .Where(x => EF.Functions.Like(x.vendorContractNumber,
                                                           $"%{request.vendorContractNumber}%"));
            }

            if (request.status.HasValue)
            {
                query = query.AsNoTracking()
                            .Where(x => x.vendorContractStatus == request.status);

            }

            var data = await query.Select(x => new FindVendorContractResponse()
            {
                VMDNo = x.vendor.vendorCode,
                vendorName = x.vendor.vendorName,
                vendorContractNumber = x.vendorContractNumber,
                vendorContractType = x.vendorContractType,
                status = x.vendorContractStatus == (int)ContractStatus.NOT_STARTED ? "Not Started" :
                         x.vendorContractStatus == (int)ContractStatus.ACTIVE? "Active" :
                         x.vendorContractStatus == (int)ContractStatus.EXPIRING_SOON && EF.Functions.DateDiffDay(DateTime.Now, x.endDate) == 1 ? "Expiring in " + EF.Functions.DateDiffDay(DateTime.Now, x.endDate) + " Day" :
                         x.vendorContractStatus == (int)ContractStatus.EXPIRING_SOON && EF.Functions.DateDiffDay(DateTime.Now, x.endDate) > 1 ? "Expiring in " + EF.Functions.DateDiffDay(DateTime.Now, x.endDate) + " Days" :
                         x.vendorContractStatus == (int)ContractStatus.EXPIRED ? "Expired" : "",
                vendorId = x.vendorId

            }).ToListAsync(cancellationToken: cancellationToken);

            if (!string.IsNullOrWhiteSpace(request.vendorContractType))
            {
                data = data.Where(x => x.vendorContractType.ToUpper() == request.vendorContractType.ToUpper()).ToList();
            }

            if (data.IsEmpty())
            {
                return response.Fail(TransactionId, Message.NotFound("Vendor contract"),
                                     request.page, request.row, 0, data);
            }

            data = data.DistinctBy(x => x.vendorContractNumber).ToList();

            //DEFAULT ORDER AND SORT (ASCENDING BY VENDOR NAME)
            data = data.OrderBy(x => x.vendorName).ToList();

            if (request.orderBy == Order.DESC &&
                request.sortBy == SortVendorContract.vendorName)
            {
                data = data.OrderByDescending(x => x.vendorName).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortVendorContract.VMDNo)
            {
                data = data.OrderBy(x => x.VMDNo).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortVendorContract.vendorContractNumber)
            {
                data = data.OrderBy(x => x.vendorContractNumber).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortVendorContract.vendorContractType)
            {
                data = data.OrderBy(x => x.vendorContractType).ToList();
            }

            if (request.orderBy == Order.ASC &&
                request.sortBy == SortVendorContract.status)
            {
                data = data.OrderBy(x => x.status).ToList();
            }

            total = data.Count;

            request.row = request.row > 0 ? request.row : 10;
            request.page = request.page > 0 ? request.page : 1;

            data = data.Skip((request.page - 1) * request.row)
                       .Take(request.row)
                       .ToList();

            return response.Success(TransactionId, Message.Found("Vendor contract"),
                                    request.page, request.row, total, data);
        }
    }
}