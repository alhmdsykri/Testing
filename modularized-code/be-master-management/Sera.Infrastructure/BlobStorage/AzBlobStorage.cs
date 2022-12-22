using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using Sera.Common.Interface.BlobStorage;

namespace Sera.Infrastructure.BlobStorage
{
    public class AzBlobStorage : IBlobStorage
    {
        public string FileName { get; private set; }

        public async Task<string> UploadAsync(string containerName, string blobName, bool overwrite, Stream content)
        {
            BlobContainerClient container = new($"", containerName); //Please provide connection string
            await container.CreateIfNotExistsAsync(PublicAccessType.BlobContainer);

            BlobClient blob = container.GetBlobClient(blobName);

            await blob.UploadAsync(content, overwrite: overwrite);

            return blob.Uri.AbsoluteUri;
        }

        public string Upload(string containerName, string blobName, bool overwrite, Stream content)
        {
            BlobContainerClient container = new($"", containerName); //Please provide connection string
            container.CreateIfNotExists(PublicAccessType.BlobContainer);

            BlobClient blob = container.GetBlobClient(blobName);

            blob.Upload(content, overwrite: overwrite);

            return blob.Uri.AbsoluteUri;
        }

        public async Task<string> ReadFile(string containerName, string prefix)
        {
            BlobContainerClient container = new($"", containerName); //Please provide connection string
            string fileName = container.GetBlobs(prefix: prefix).FirstOrDefault().Name;
            string content = string.Empty;
            FileName = fileName;

            if (string.IsNullOrWhiteSpace(fileName))
            {
                return content;
            }

            BlobClient client = container.GetBlobClient(fileName);

            if (!await client.ExistsAsync())
            {
                return content;
            }

            var response = await client.DownloadAsync();
            if (response.Value.ContentLength <= 0)
            {
                return content;
            }

            using (var reader = new StreamReader(response.Value.Content))
            {
                while (!reader.EndOfStream)
                {
                    content = await reader.ReadToEndAsync();
                }
            }

            return content;
        }

        public async Task<List<string>> ReadLineFile(string containerName, string prefix)
        {
            BlobContainerClient container = new($"", containerName); //Please provide connection string
            string fileName = container.GetBlobs(prefix: prefix).FirstOrDefault().Name;
            List<string> content = new();
            FileName = fileName;

            if (string.IsNullOrWhiteSpace(fileName))
            {
                return content;
            }

            BlobClient client = container.GetBlobClient(fileName);

            if (!await client.ExistsAsync())
            {
                return content;
            }

            var response = await client.DownloadAsync();
            if (response.Value.ContentLength <= 0)
            {
                return content;
            }

            using (var reader = new StreamReader(response.Value.Content))
            {
                while (!reader.EndOfStream)
                {
                    var row = await reader.ReadLineAsync();
                    content.Add(row);
                }
            }

            return content;
        }

        public async Task<string> CopyFile(string containerName, string oldFile, string newFile)
        {
            string newURI = string.Empty;
            BlobContainerClient container = new($"", containerName); //Please provide connection string

            BlockBlobClient oldBlob = container.GetBlockBlobClient(oldFile);
            if (!await oldBlob.ExistsAsync())
            {
                return newURI;
            }

            BlockBlobClient newBlob = container.GetBlockBlobClient(newFile);
            newURI = newBlob.Uri.ToString();

            return newURI;
        }

        public async Task<bool> RemoveFile(string containerName, string fileName)
        {
            bool result = false;
            BlobContainerClient container = new($"", containerName); //Please provide connection string

            BlockBlobClient blob = container.GetBlockBlobClient(fileName);
            if (!await blob.ExistsAsync())
            {
                return result;
            }

            result = await blob.DeleteIfExistsAsync();
            return result;
        }
    }
}
