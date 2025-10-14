package DockerImageBuilder

import (
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/archive"
	"github.com/docker/docker/pkg/jsonmessage"
	"github.com/moby/term"
	"os"

	"context"
	"log"
)

func getCLI() (*client.Client, error) {
	return client.NewClientWithOpts(client.FromEnv)
}

func ImageBuild(dockerFilePath, buildContextPath string, tags []string) {

	ctx := context.Background()
	cli, err := getCLI()
	if err != nil {
		panic(err)
	}

	buildOpts := types.ImageBuildOptions{
		Dockerfile: dockerFilePath,
		Tags:       tags,
	}

	buildCtx, _ := archive.TarWithOptions(buildContextPath, &archive.TarOptions{})

	resp, err := cli.ImageBuild(ctx, buildCtx, buildOpts)
	if err != nil {
		log.Fatalf("build error - %s", err)
	}
	defer resp.Body.Close()

	termFd, isTerm := term.GetFdInfo(os.Stderr)
	jsonmessage.DisplayJSONMessagesStream(resp.Body, os.Stderr, termFd, isTerm, nil)
}
