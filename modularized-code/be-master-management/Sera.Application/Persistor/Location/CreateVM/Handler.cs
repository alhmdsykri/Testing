namespace Sera.Application.Persistor
{
    public class CreateLocationVMHandler : BaseHandler,
                                         IRequestHandler<CreateLocationVMRequest, IResultStatus>
    {
        public CreateLocationVMHandler(IDbContext dbContext, IMessage message, IRESTOrganizationClient orgClient)
               : base(dbContext, message, orgClient)
        { }

        public async Task<IResultStatus> Handle(CreateLocationVMRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            #region CONSTRUCT PAYLOAD
            ServiceBusRequest<string> sbusRequest = new()
            {
                data = string.Empty,
                entity = "Location",
                feURL = string.Empty,
                method = HTTPMethod.POST.ToString(),
                filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                source = "FleetX",              
                username = request.userId,
                transactionId = request.transactionId,
                startDate = request.startDate,
                endDate = request.endDate
            };
            CreateLocationVMModel createLocationVMModel = new()
            {
                locationCode = request.locationCode.ToString(),
                locationName = request.locationName,
                locationTypeId = request.locationTypeId,
                locationAddress = request.address,
                businessUnitId = request.businessUnitId,
                businessUnitCode = string.Empty,
                businessUnitName = string.Empty,
                branchId = request.branchId,
                timeOffset = request.timeOffset,
                latitude = request.latitude,
                longitude = request.longitude
            };
            #endregion

            #region CHECK BUSINESS RULE
            IQueryable<SQL.Location>? queryLocation = null;
            IQueryable<SQL.LocationType>? queryLocationType = null;            

            var apiBusinessUnitResponse = await orgClient.GetBusinessUnitAsync(request.transactionId, request.userId, request.businessUnitId);

            if (apiBusinessUnitResponse.Status == Common.ResponseStatus.FAIL)
            {
                #region SEND MESSAGE TO SERVICE BUS FIREBASE REJECTED
                sbusRequest.data = createLocationVMModel.Serialize();
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = "Access denied, you've got no data permission Or Business Unit Not Found";

                List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestRejected);
                #endregion
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            queryLocation = dbContext.Location
                             .AsNoTracking()
                             .Where(x => x.locationCode == request.locationCode.ToString() || x.locationName.Trim() == request.locationName.Trim());

            queryLocationType = dbContext.LocationType
                             .AsNoTracking()
                             .Where(x => x.locationTypeId == request.locationTypeId);

            if (!queryLocation.IsEmpty() || queryLocationType.IsEmpty())
            {
                #region SEND MESSAGE TO SERVICE BUS FIREBASE REJECTED
                sbusRequest.data = createLocationVMModel.Serialize();
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = "Location Already Exists Or Master Location Type Not Exists";

                List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestRejected);
                #endregion
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            #region GET Branch Detail
            var apiBranchResponse = await orgClient.GetBranchAsync(request.transactionId, request.userId, request.branchId);

            if (apiBranchResponse.Status == Common.ResponseStatus.FAIL)
            {
                #region SEND MESSAGE TO SERVICE BUS FIREBASE REJECTED
                sbusRequest.data = createLocationVMModel.Serialize();
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = "Access denied, you've got no data permission Or Branch Not Found";

                List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestRejected);
                #endregion
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }

            if (apiBranchResponse.Data.businessUnitId != request.businessUnitId)
            {
                #region SEND MESSAGE TO SERVICE BUS FIREBASE REJECTED
                sbusRequest.data = createLocationVMModel.Serialize();
                sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
                sbusRequest.status = (int)EventStatus.REJECTED;
                sbusRequest.message = "Business Unit doesn't match with Business Unit of Branch";

                List<string> jsonRequestRejected = new() { sbusRequest.Serialize() };
                await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                               CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                               jsonRequestRejected);
                #endregion
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            #region ASSIGN VALUE BUSINESS UNIT FROM ORGANIZATION SERVICE
            createLocationVMModel.businessUnitCode = apiBusinessUnitResponse.Data.businessUnitCode;
            createLocationVMModel.businessUnitName = apiBusinessUnitResponse.Data.businessUnitName;
            createLocationVMModel.companyId = apiBusinessUnitResponse.Data.companyId;
            createLocationVMModel.companyCode = apiBusinessUnitResponse.Data.companyCode;
            createLocationVMModel.companyName = apiBusinessUnitResponse.Data.companyName;
            createLocationVMModel.branchCode = apiBranchResponse.Data.branchCode;
            createLocationVMModel.branchName = apiBranchResponse.Data.branchName;
            #endregion

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS INPROGRESS    
            sbusRequest.data = createLocationVMModel.Serialize();
            sbusRequest.filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME;
            sbusRequest.status = (int)EventStatus.INPROGRESS;

            List<string> jsonRequestInprogress = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequestInprogress);
            #endregion

            #region INSERT INTO SQL
            string uniqueKey = $"{request.longitude}{request.latitude}{request.locationName.ToLower()}";

            SQL.Location entity = new();
            entity.businessUnitId = apiBusinessUnitResponse.Data.businessUnitId;
            entity.businessUnitCode = apiBusinessUnitResponse.Data.businessUnitCode;
            entity.businessUnitName = apiBusinessUnitResponse.Data.businessUnitName;
            entity.branchId = request.branchId;
            entity.branchCode = apiBranchResponse.Data.branchCode;
            entity.branchName = apiBranchResponse.Data.branchName;
            entity.latitude = request.latitude;
            entity.locationAddress = request.address;
            entity.locationCode = request.locationCode.ToString();
            entity.locationName = request.locationName;
            entity.locationTypeId = request.locationTypeId;
            entity.longitude = request.longitude;
            entity.source = "VM";
            entity.status = (int)EventStatus.COMPLETED;
            entity.timeOffset = createLocationVMModel.timeOffset;
            entity.uniqueKey = uniqueKey;
            entity.version = AppConst.DATA_VERSION;
            entity.createdBy = request.userId;
            entity.createdAt = DateTime.UtcNow;
            entity.modifiedBy = request.userId;
            entity.modifiedAt = DateTime.UtcNow;
            entity.transactionId = request.transactionId;

            await dbContext.Location.AddAsync(entity, cancellationToken);

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus($"Error for transaction Id: {request.transactionId}");
            }
            #endregion

            if (request.locationTypeId == (int)LocationType.SUBPOOL || request.locationTypeId == (int)LocationType.POOL ||
                request.locationTypeId == (int)LocationType.CUSTOMERPOOL)
            {
                #region CQRS USER

                LocationVMCQRSRequestModel cqrsRequest = new();
                cqrsRequest.companyId = apiBusinessUnitResponse.Data.companyId;
                cqrsRequest.companyCode = apiBusinessUnitResponse.Data.companyCode;
                cqrsRequest.companyName = apiBusinessUnitResponse.Data.companyName;
                cqrsRequest.businessUnitId = apiBusinessUnitResponse.Data.businessUnitId;
                cqrsRequest.businessUnitCode = apiBusinessUnitResponse.Data.businessUnitCode;
                cqrsRequest.businessUnitName = apiBusinessUnitResponse.Data.businessUnitName;
                cqrsRequest.branchId = request.branchId;
                cqrsRequest.branchCode = apiBranchResponse.Data.branchCode;
                cqrsRequest.branchName = apiBranchResponse.Data.branchName;
                cqrsRequest.locationId = entity.locationId;
                cqrsRequest.locationCode = request.locationCode.ToString();
                cqrsRequest.locationName = request.locationName;

                ServiceBusRequest<LocationVMCQRSRequestModel> sbusUserRequest = new()
                {
                    data = cqrsRequest,
                    entity = sbusRequest.entity,
                    feURL = sbusRequest.feURL,
                    method = sbusRequest.method,
                    source = sbusRequest.source,
                    status = (int)EventStatus.INPROGRESS,
                    username = request.userId,
                    transactionId = request.transactionId,
                    filter = AppConst.SERVICE_BUS_CQRS_LOCATION_USER_SUBS_DLQ_FILTER_NAME,
                    action = AppConst.FA_ACTION_CQRS_CREATE_LOCATION,
                    startDate = DateTime.UtcNow, //[REVISIT]
                    endDate = DateTime.UtcNow.AddHours(AppConst.MAX_DAY_END_DATE) //[REVISIT]
                };

                List<string> jsonUserRequest = new() { sbusUserRequest.Serialize() };
                jsonUserRequest = new() { sbusUserRequest.Serialize() };
                await message.SendMessageAsync(CommonConst.CQRS_SERVICE_BUS_TOPIC_NAME,
                                               AppConst.SERVICE_BUS_CQRS_LOCATION_USER_SUBS_FILTER_NAME,
                                               jsonUserRequest);
                #endregion
            }

            #region SEND MESSAGE TO SERVICE BUS TO CREATE EVENT SOURCE STATUS COMPLETED      
            sbusRequest.data = createLocationVMModel.Serialize();
            sbusRequest.filter = CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME;
            sbusRequest.status = (int)EventStatus.COMPLETED;

            List<string> jsonRequestCompleted = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequestCompleted);
            #endregion           

            #region SEND MESSAGE TO SERVICE BUS FIREBASE COMPLETED
            sbusRequest.data = createLocationVMModel.Serialize();
            sbusRequest.filter = CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME;
            sbusRequest.status = (int)EventStatus.COMPLETED;
            sbusRequest.message = Message.InsertSuccess("Location");

            List<string> jsonRequestFirebase = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_FIREBASE_SUBS_FILTER_NAME,
                                           jsonRequestFirebase);
            #endregion

            return result.ReturnSuccessStatus($"Transaction Id {request.transactionId} success.");
        }
    }
}