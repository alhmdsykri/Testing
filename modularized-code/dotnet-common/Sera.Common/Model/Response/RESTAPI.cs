namespace Sera.Common.Model.Response
{
    [ExcludeFromCodeCoverage]
    public class Response
    {
        public string TransactionId { get; private set; }
        public string Message { get; private set; }
        [JsonIgnore]
        [IgnoreDataMember]
        public ResponseStatus Status { get; private set; }

        public Response Fail(string transactionId, string message)
        {
            this.TransactionId = transactionId;
            this.Message = message;
            this.Status = ResponseStatus.FAIL;

            return this;
        }

        public Response Success(string transactionId, string message)
        {
            this.TransactionId = transactionId;
            this.Message = message;
            this.Status = ResponseStatus.SUCCESS;

            return this;
        }
    }

    [ExcludeFromCodeCoverage]
    public class Response<T> where T : class
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? TransactionId { get; set; }
        public string Message { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Page { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? NextPage { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Row { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Total { get; set; }
        public T Data { get; set; }
        [JsonIgnore]
        [IgnoreDataMember]
        public ResponseStatus Status { get; set; }
        public Response<T> Fail(string transactionId, string message, int page, int row, int total, T? data)
        {
            this.TransactionId = transactionId;
            this.Message = message;
            this.Page = page;
            this.Row = row;
            this.Total = total;
            this.Data = data;
            this.Status = ResponseStatus.FAIL;

            return this;
        }
        public Response<T> Fail(string transactionId, string message, int page, int nextPage, int row, int total, T? data)
        {
            this.TransactionId = transactionId;
            this.Message = message;
            this.Page = page;
            this.NextPage = nextPage;
            this.Row = row;
            this.Total = total;
            this.Data = data;
            this.Status = ResponseStatus.FAIL;

            return this;
        }
        public Response<T> Fail(string transactionId, string message, T? data)
        {
            this.TransactionId = transactionId;
            this.Message = message;
            this.Data = data;
            this.Status = ResponseStatus.FAIL;

            return this;
        }

        public Response<T> Fail(string message, int page, int row, int total, T? data)
        {
            this.Message = message;
            this.Page = page;
            this.Row = row;
            this.Total = total;
            this.Data = data;
            this.Status = ResponseStatus.FAIL;

            return this;
        }

        public Response<T> Fail(string message, T? data)
        {
            this.Message = message;
            this.Data = data;
            this.Status = ResponseStatus.FAIL;

            return this;
        }

        public Response<T> Success(string transactionId, string message, int page, int row, int total, T? data)
        {
            this.TransactionId = transactionId;
            this.Message = message;
            this.Page = page;
            this.Row = row;
            this.Total = total;
            this.Data = data;
            this.Status = ResponseStatus.SUCCESS;

            return this;
        }

        public Response<T> Success(string transactionId, string message, int page, int nextPage, int row, int total, T? data)
        {
            this.TransactionId = transactionId;
            this.Message = message;
            this.Page = page;
            this.NextPage = nextPage;
            this.Row = row;
            this.Total = total;
            this.Data = data;
            this.Status = ResponseStatus.SUCCESS;

            return this;
        }

        public Response<T> Success(string transactionId, string message, T? data)
        {
            this.TransactionId = transactionId;
            this.Message = message;
            this.Data = data;
            this.Status = ResponseStatus.SUCCESS;

            return this;
        }

        public Response<T> Success(string message, int page, int row, int total, T? data)
        {
            this.Message = message;
            this.Page = page;
            this.Row = row;
            this.Total = total;
            this.Data = data;
            this.Status = ResponseStatus.SUCCESS;

            return this;
        }
    }
}
