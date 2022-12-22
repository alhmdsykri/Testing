namespace Sera.Application.Usecase
{
    public class UpdateVendorContractHandler : BaseHandler,
                 IRequestHandler<UpdateVendorContractRequest, Response>
    {
        public UpdateVendorContractHandler(IHttpContextAccessor httpContext, IDbContext dbContext,
                                           ICosmosContext eventContext, IMessage message)
            : base(httpContext, dbContext, eventContext, message)
        { }

        public async Task<Response> Handle(UpdateVendorContractRequest request,
                                           CancellationToken cancellationToken)
        {
            Response response = new();

            // Validate StartDate and EndDate
            var oldVendorContract = dbContext.VendorContract.AsNoTracking()
                                                  .Where(x => x.vendorContractId == request.vendorContractId &&
                                                         x.status == (int)EventStatus.COMPLETED)
                                                  .Select(x => new { x.vendorContractStatus, x.startDate, x.endDate }).FirstOrDefault();

            if (oldVendorContract.vendorContractStatus == (int)ContractStatus.NOT_STARTED)
            {
                if (request.startDate < DateTime.UtcNow.Date || request.startDate > request.endDate)
                {
                    return response.Fail(TransactionId, "Start Date can't be less than Today or Start Date greater than End Date");
                }
                if (request.endDate < request.startDate || request.endDate < DateTime.UtcNow.Date)
                {
                    return response.Fail(TransactionId, "End Date can't less than Start Date and Today");
                }
            }

            if (oldVendorContract.vendorContractStatus == (int)ContractStatus.ACTIVE ||
                oldVendorContract.vendorContractStatus == (int)ContractStatus.EXPIRING_SOON)
            {
                if (request.startDate != oldVendorContract.startDate)
                {
                    return response.Fail(TransactionId, "Sorry..if contract status active or expiry start date can not updated");
                }

                if (request.endDate < DateTime.UtcNow.Date || request.endDate < request.startDate)
                {
                    return response.Fail(TransactionId, "End Date can't less than Start Date and Today");
                }
            }

            if (oldVendorContract.vendorContractStatus == (int)ContractStatus.EXPIRED)
            {
                return response.Fail(TransactionId, "Vendor Contract has been expired, Can not Update");
            }

            // Validate Vendor Contract Id Existing
            var domain = dbContext.VendorContract
                                  .Where(x => x.vendorContractId == request.vendorContractId && x.status == (int)EventStatus.COMPLETED);

            if (domain == null)
            {
                return response.Fail(TransactionId, Message.NotFound("Vendor Contract Id"));
            }

            var isExists = await dbContext.VendorContract
                                          .AsNoTracking()
                                          .AnyAsync(x => x.vendorContractNumber == request.contractNumber.Trim() &&
                                                         x.vendorContractId != request.vendorContractId,
                                                    cancellationToken: cancellationToken);

            if (isExists)
            {
                return response.Fail(TransactionId, Message.Exist("Vendor Contract Number"));
            }

            //BUILD LOCATION COSMOS DB COLLECTION (TABLE) ENTITY
            EventHistory collection = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = TransactionId,
                method = HTTPMethod.PUT.ToString(),
                entity = "Vendor Contract",
                source = SourceURL,
                payload = request.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                userId = UserId,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            //INSERT INTO COSMOS DB
            await eventContext.CreateAsync(collection);

            //SEND ENTITY TO SERVICE BUS
            ServiceBusRequest<UpdateVendorContractRequest> sbusRequest = new()
            {
                action = AppConst.FA_ACTION_UPDATE_VENDOR_CONTRACT,
                data = request,
                entity = "Vendor Contract",
                feURL = ClientURL,
                method = HTTPMethod.PUT.ToString(),
                source = SourceURL,
                transactionId = TransactionId,
                username = UserId,
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_MSSQL_SUBS_FILTER_NAME,
                                           jsonRequest);

            return response.Success(TransactionId, Message.Accepted("Vendor Contract"));
        }
    }
}