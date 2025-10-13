package main

import (
	"context"
	"fmt"
	"io"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"net/http"
	"os"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

var connectState = connect()

/* Main connection to kuber function*/
func connect() *kubernetes.Clientset {
	config, err := rest.InClusterConfig()
	if err != nil {
    // Handle error, e.g., if not running in a cluster
	}
	clientset, err := kubernetes.NewForConfig(config)
	return clientset
}

/* Set namespace by string */
func setNamespace(namespace string) {

	if connectState == nil {
		panic("ConnectState is nil")
	}
	nsName := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: namespace,
		},
	}

	_, err := connectState.CoreV1().Namespaces().Create(context.Background(), nsName, metav1.CreateOptions{})
	if err != nil {
		return
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	t1 := time.Now()
	if r.Method == "POST" {
		body, _ := io.ReadAll(r.Body)
		receivedString := string(body)
		setNamespace(receivedString)

	}
	t2 := time.Now()
	fmt.Println(t2.Sub(t1))
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handler)

	err := http.ListenAndServe(":3333", mux)
	if err == nil {
		fmt.Println("Listening on port 3333")
	} else {
		os.Exit(1)
	}
}
