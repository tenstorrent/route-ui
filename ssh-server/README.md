# Running the SSH server on your local, or connecting to the remote server

## Table of Content
- [Create an SSH key pair](#create-an-ssh-key-pair)
- [Connect to a remote server](#connect-to-a-remote-server)
    * [Fisrt time setup](#fisrt-time-setup)
        + [Opening a connection](#opening-a-connection)
        + [Copying your public key to the server](#copying-your-public-key-to-the-server)
        + [Update your ssh config](#update-your-ssh-config)
- [Connect to a local server](#connect-to-a-local-server)
    * [Prerequisites](#prerequisites)
    * [Update your ssh config](#update-your-ssh-config-1)
    * [Build and run the server](#build-and-run-the-server)
    * [Connecting to the server](#connecting-to-the-server)
- [Copying data to the remote server](#copying-data-to-the-remote-server)
    * [Copying the data to the server](#copying-the-data-to-the-server)
- [Advanced local server build configuration](#advanced-local-server-build-configuration)
    * [Username](#username)
    * [SSH key file](#ssh-key-file)
    * [Data folder](#data-folder)
    * [Combining all arguments](#combining-all-arguments)

## Create an SSH key pair

Create an SSH key pair if you don't have one already. You can do this by running the following command in your terminal:

```bash
ssh-keygen -t ed25519 -C "<LABEL FOR THE KEY>" -f ~/.ssh/<NAME OF THE KEY PAIR>
```

This will create a new SSH key pair in the `~/.ssh` folder. If you have multiple files there, you will need to find the one you just created. The key pair will be named `<NAME OF THE KEY PAIR>` for the private key and `<NAME OF THE KEY PAIR>.pub` for the public key.

Replace `<LABEL FOR THE KEY>` with a label for the key. This is just a comment that will be added to the key file to help identifying the key.

## Connect to a remote server

### Fisrt time setup

The first time you login to the SSH server this will be done using password authentication, then you will save your public authentication key on the server. That way you can connect without typing your password every time.

#### Opening a connection

You can access the remote SSH server using the following command:

```bash
ssh <YOUR USERNAME>@<REMOTE SERVER> -o PreferredAuthentications=password -o PubkeyAuthentication=no -o PasswordAuthentication=yes
```

Your username will be the same one used by your email/VPN access. You should see a message asking you to confirm the authenticity of the server. Type `yes` and press `Enter`.

If you see a bash prompt, you have successfully connected to the server.

#### Copying your public key to the server

For this step you need a key pair. You can generate the key pair on your local machine, as per [Create an SSH key pair](#create-an-ssh-key-pair).

On the ssh shell you opened on the previous step, create the `~/.ssh` folder if it doesn't exist:

```bash
mkdir -p ~/.ssh
```


Than open the public key file _on your computer_ and copy it's _full contents_, including spaces.

After that you will append the public key to the `~/.ssh/authorized_keys` file. On the ssh shell you have opened previously, run the following command:

```bash
echo "<YOUR PUBLIC KEY>" >> ~/.ssh/authorized_keys
```

Where it says `<YOUR PUBLIC KEY>` you will paste the public key you copied.

#### Update your ssh config

Once you have connected for the first time to the ssh server and copied your public key there, you need to configure your local ssh config file to automatically use the key pair instead of asking for a password.

To do that you will have to add a new `Host` entry for the remote server to your `~/.ssh/config` file. If you don't have this file yet, create it.

Add the following lines to the file:

```
Host <SERVER HOST>
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<NAME OF THE PRIVATE KEY>
```

Replace `<SERVER HOST>` with the host of the server you want to connect to, like `localhost` for connecting to the local server, or the server name to connect to a remote server.

`<NAME OF THE PRIVATE KEY>` should be the name of your private key file, without a file extension.

## Connect to a local server

### Prerequisites

Install docker on your machine. You can find the installation instructions [here](https://docs.docker.com/get-docker/).

Copy the _public key_ generated per the [Create an SSH key pair](#create-an-ssh-key-pair) section to the same folder as the `Dockerfile` and name it `id_ed25519.pub`. This is the key that will be used to authenticate you to the server.

### Update your ssh config

You will need to configure your local ssh config file to automatically use the key pair instead of asking for a password.

To do that you will have to add a new `Host` entry for the remote server to your `~/.ssh/config` file. If you don't have this file yet, create it.

Add the following lines to the file:

```
Host localhost
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<NAME OF THE PRIVATE KEY>
```

`<NAME OF THE PRIVATE KEY>` should be the name of your private key file, without a file extension.

### Build and run the server

Build the image using docker:

```bash
docker build --build-arg username=$(logname) -t local-ssh-image .
```

This will create a new docker image with the name `local-ssh-image` and the username set to your local username (see [Advanced local server build configuration](#advanced-local-server-build-configuration) for more information).

Run the server using the following command:

```bash
docker run -dit -p 2222:22 --name local-ssh-server local-ssh-image:latest
```

This will create a new container with the name `local-ssh-server` and the latest version of the image `local-ssh-image`.

The server will be running on port `2222` of your local machine.

### Connecting to the server

You can now connect to the server using the following command:

```bash
ssh -p 2222 localhost
```

You should see a message asking you to confirm the authenticity of the server. Type `yes` and press `Enter`.

If you see a bash prompt, you have successfully connected to the server.

## Copying data to the remote server

On the SSH server you connected to (either local or remote), create the folder where the data will be copied to. You can do this by running the following command:

```bash
mkdir -p /proj_sw/user_dev/<YOUR USERNAME>/tt_build
```

**NOTE:** The convention is to use the `/proj_sw/user_dev/<YOUR USERNAME>` folder to store your data.

**NOTE:** The `tt_build` sub-folder is required by `perf-ui`. It automatically appends it to the folder name, but `route-ui` does not.

### Copying the data to the server

You can then copy the files to the server using the `scp` command. For example:
```bash
scp /path/to/your/data/* <YOUR USERNAME>@<REMOTE SERVER>:/proj_sw/user_dev/<YOUR USERNAME>/tt_build
```

**NOTE:** It may be a good idea to compress the data before sending it over to the server so the transfer is faster.

## Advanced local server build configuration

### Username

You can set the **username** that will be created on the docker image by passing the `username` argument to the `docker build` command. For example:

```bash
docker build --build-arg username=<YOUR USERNAME> -t local-ssh-image .
```

To create a user with the same name as your local user, you can use the `logname` command to get your username. For example:

```bash
docker build --build-arg username=$(logname) -t local-ssh-image .
```

The default value for this argument is: `sshuser`.

### SSH key file

You can set the **ssh key file** that will be used to authenticate the user by passing the `keypath` argument to the `docker build` command. For example:

```bash
docker build --build-arg keypath=/path/to/your/key -t local-ssh-image .
```

The default value for this argument is: `./id_ed25519.pub`.

### Data folder

You can set the **data folder** containing all the tests data that will be copied to the server with the `datafolder` argument. For example:

```bash
docker build --build-arg datafolder=/path/to/your/data -t local-ssh-image .
```

The default value for this argument is: `./data`.

### Combining all arguments

You can combine all the arguments to build the image with the following command:

```bash
docker build --build-arg username=<YOUR USERNAME> --build-arg keypath=/path/to/your/key --build-arg datafolder=/path/to/your/data -t local-ssh-image .
```