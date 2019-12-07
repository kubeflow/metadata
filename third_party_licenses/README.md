This folder contains a list of license file locations and types in `license_info.csv`  for all dependencies and transitive dependencies of the metadata docker image.

The actual license contents of all dependencies shall be generated via the following command and put into the docker image:
```
$ python concatenate_license.py
```

Whenever there is a dependency change of the metadata docker image, `license_info.csv` should be updated in the following steps.

# Generate the license information
Thanks to [kfp-license-tools](https://github.com/kubeflow/pipelines/tree/master/third_party/cli), we can gather the license information automatically for most dependencies.

## Setup
1. Download the [kfp_local_repository](https://github.com/kubeflow/pipelines) to your local folder `<kfp_local_repo>`.
2. Install `kfp-license-tools`.
    ```
    $ python <kfp_local_repo>/third_party/cli/setup.py install
    ```
3. We will do all the work under `third_party_licenses` folder:

    ```
    $ cd kubeflow/metadata/third_party_licenses
    ```

## Get all dependency repositories
1. Get all Golang dependencies from Go module and save it into `dep.txt`.

    ```
    $ go list -m all | cut -d ' ' -f 1 > dep.txt
    ```

2. Get the repository URL for each dependency via this command:
    ```
    $ python <kfp_local_repo>/third_party/cli/get_github_repo.py

    ......
    Successfully resolved github repo for 89 dependencies and saved to repo.txt. Failed to resolve 3 dependencies.
    We failed to resolve the following dependencies:
    gomodules.xyz/jsonpatch/v2
    honnef.co/go/tools
    ml_metadata
    ```

3. Create a CSV for unknown repositories.

    As you can see, there are 3 dependencies that can not be resolved automatically from the previous step. We have to search for these repositories manually and add a CSV file `dep_repo.manual.csv` for future runs.

    Rerun the command in step 2 to resolve all repositories this time:
    ```
    $ python <kfp_local_repo>/third_party/cli/get_github_repo.py

    ......
    Successfully resolved github repo for 92 dependencies and saved to repo.txt. Failed to resolve 0 dependencies.
    ```

## Get all license URLs and types

1. Get all license information by this command:
    ```
    $ python <kfp_local_repo>/third_party/cli/get_github_license_info.py --github-api-token-file=<github_token_file>
    ......
    Fetching license for google/ml-metadata
    Fetching license for kubernetes-sigs/controller-runtime
    Fetching license for kubernetes-sigs/testing_frameworks
    Fetching license for kubernetes-sigs/yaml
    Fetched github license info, 91 succeeded, 0 failed.
    ```
    You have to create a `<github_token_file>` in order to access Github repositories. You shall see `license_info.csv` file produced.

2. Update license types.


    If you open `license_info.csv`, you can see some fields are marked as `Other`. We have to update them to the right license types. First we need to grep all these unknown license URLs:
    ```
    $ cat license_info.csv | grep Other | cut -d ',' -f 2

    GoogleCloudPlatform/gcloud-golang,https://github.com/googleapis/google-cloud-go/blob/master/LICENSE,Other,https://raw.githubusercontent.com/googleapis/google-cloud-go/master/LICENSE
    ghodss/yaml,https://github.com/ghodss/yaml/blob/master/LICENSE,Other,https://raw.githubusercontent.com/ghodss/yaml/master/LICENSE
    gogo/protobuf,https://github.com/gogo/protobuf/blob/master/LICENSE,Other,https://raw.githubusercontent.com/gogo/protobuf/master/LICENSE
    ......
    ```

    Now we can open these license all at once in Chrome via a plugin called [OpenList](https://chrome.google.com/webstore/detail/openlist/nkpjembldfckmdchbdiclhfedcngbgnl?hl=en).

    After checking the license content one by one, we can now create `additional_license_info.csv` to record the right license types. The content  of `additional_license_info.csv` looks like this:
    ```
    https://github.com/googleapis/google-cloud-go/blob/master/LICENSE,Apache License 2.0
    https://github.com/ghodss/yaml/blob/master/LICENSE,MIT
    https://github.com/gogo/protobuf/blob/master/LICENSE,BSD 3-Clause "New" or "Revised" License
    ......
    ```

    Finally, we can patch the additional license types in `additional_license_info.csv` on `license_info.csv` to get the final list of licenses with types.

    ```
    $  python patch_additional_license_info.py
    ```

## Dependency source code
We have to mirror source code in the image under `third_party` for code with MPL, EPL, GPL or CDDL licenses. We don't have the such dependencies right now.
