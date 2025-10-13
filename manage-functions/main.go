package main

import (
	"context"
	"flag"
	"fmt"
	"io"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"net/http"
	"os"
	"path/filepath"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

var connectState = connect()

/* Main connection to kuber function*/
func connect() *kubernetes.Clientset {
	var kubeconfig *string
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join("./", ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()

	// use the current context in kubeconfig
	config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		panic(err.Error())
	}

	// create the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
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
