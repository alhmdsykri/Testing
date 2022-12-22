namespace Sera.Common.Interface.BlobStorage
{
    public interface IBlobStorage
    {
        string FileName { get; }

        Task<string> UploadAsync(string containerName, string blobName, bool overwrite, Stream content);
        string Upload(string containerName, string blobName, bool overwrite, Stream content);
        Task<string> ReadFile(string containerName, string prefix);
        Task<List<string>> ReadLineFile(string containerName, string prefix);
        Task<string> CopyFile(string containerName, string oldFile, string newFile);
        Task<bool> RemoveFile(string containerName, string fileName);
    }
}
