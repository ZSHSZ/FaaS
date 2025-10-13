FROM golang:1.25.2

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o /manage_functions

EXPOSE 3333

CMD ["/manage_functions"]
