<?php

class FileStorageKeyExistsException extends Exception {}
class FileStorageKeyDoesNotExistException extends Exception {}
class FileStorageErrorReadingFile extends Exception {}
class FileStorageErrorWritingFile extends Exception {}
class FileStorageErrorDeletingFile extends Exception {}

class FileStorage {

    protected $dirpath;

    public function __construct($dirpath) {
        $this->dirpath = rtrim($dirpath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    }

    public function generateKey() {
        do {
            $key = md5(uniqid(null, true));
        } while ($this->has($key));
        return $key;
    }

    public function keyToFilepath($key) {
        return $this->dirpath . $key;
    }

    public function has($key) {
        $filepath = $this->keyToFilepath($key);
        return file_exists($filepath);
    }

    public function get($key) {
        $filepath = $this->keyToFilepath($key);
        if (!file_exists($filepath)) {

            throw new FileStorageKeyDoesNotExistException('Key does not exist.');
        }
        $value = file_get_contents($filepath);
        if ($value === false) {

            throw new FileStorageErrorReadingFile('Error when reading a file.');
        }
        return $value;
    }

    public function set($key, $value) {
        $filepath = $this->keyToFilepath($key);
        if (file_exists($filepath)) {

            throw new FileStorageKeyExistsException('Key already exists.');
        }
        $bytes = file_put_contents($filepath, (string)$value);
        if ($bytes === false) {

            throw new FileStorageErrorWritingFile('Error when writing to a file.');
        }
        return $this;
    }

    public function clear($key) {
        $filepath = $this->keyToFilepath($key);
        if (!file_exists($filepath)) {

            throw new FileStorageKeyDoesNotExistException('Key does not exist.');
        }
        $status = unlink($filepath);
        if ($status === false) {

            throw new FileStorageErrorDeletingFile('Error when deleting a file.');
        }
        return $this;
    }
}

$storage = new FileStorage(__DIR__ . '/storage');

if (array_key_exists('action', $_POST)) {
    switch ($_POST['action']) {
        case 'has':
            $returned = array('has' => $storage->has($_POST['key']));
            break;
        case 'get':
            $returned = array('value' => json_decode($storage->get($_POST['key'])));
            break;
        case 'set':
            $key = $storage->generateKey();
            $storage->set($key, $_POST['value']);
            $returned = array('key' => $key);
            break;
    }
}

echo json_encode($returned);