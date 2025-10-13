FROM golang:1.25.2

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /manage_functions

EXPOSE 3333

CMD ["/manage_functions"]
